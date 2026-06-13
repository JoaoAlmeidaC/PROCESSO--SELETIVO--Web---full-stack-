const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/atendimentos.json');

function loadData() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error('Falha ao carregar base de dados: ' + err.message);
  }
}

// GET /api/atendimentos
exports.listar = (req, res) => {
  try {
    let data = loadData();

    const { busca, status, area, advogado, dataInicio, dataFim, page = 1, limit = 10 } = req.query;

    if (busca) {
      const termo = busca.toLowerCase();
      data = data.filter(a =>
        a.cliente.toLowerCase().includes(termo) ||
        a.advogado.toLowerCase().includes(termo) ||
        a.area.toLowerCase().includes(termo) ||
        a.tipo.toLowerCase().includes(termo)
      );
    }

    if (status) {
      data = data.filter(a => a.status === status);
    }

    if (area) {
      data = data.filter(a => a.area === area);
    }

    if (advogado) {
      data = data.filter(a => a.advogado === advogado);
    }

    if (dataInicio) {
      data = data.filter(a => a.data >= dataInicio);
    }

    if (dataFim) {
      data = data.filter(a => a.data <= dataFim);
    }

    const total = data.length;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const totalPages = Math.ceil(total / limitNum);
    const offset = (pageNum - 1) * limitNum;
    const items = data.slice(offset, offset + limitNum);

    res.json({
      data: items,
      pagination: { page: pageNum, limit: limitNum, total, totalPages },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/atendimentos/metricas
exports.metricas = (req, res) => {
  try {
    const data = loadData();

    const total = data.length;
    const concluidos = data.filter(a => a.status === 'Concluído').length;
    const cancelados = data.filter(a => a.status === 'Cancelado').length;
    const agendados = data.filter(a => a.status === 'Agendado').length;
    const emAndamento = data.filter(a => a.status === 'Em Andamento').length;
    const receitaTotal = data.reduce((sum, a) => sum + a.valor, 0);

    // Por status
    const porStatus = [
      { status: 'Concluído', quantidade: concluidos },
      { status: 'Cancelado', quantidade: cancelados },
      { status: 'Agendado', quantidade: agendados },
      { status: 'Em Andamento', quantidade: emAndamento },
    ];

    // Por área
    const areaMap = {};
    data.forEach(a => {
      areaMap[a.area] = (areaMap[a.area] || 0) + 1;
    });
    const porArea = Object.entries(areaMap)
      .map(([area, quantidade]) => ({ area, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade);

    // Evolução mensal
    const mensalMap = {};
    data.forEach(a => {
      const mes = a.data.substring(0, 7); // YYYY-MM
      if (!mensalMap[mes]) mensalMap[mes] = { total: 0, receita: 0 };
      mensalMap[mes].total += 1;
      mensalMap[mes].receita += a.valor;
    });
    const evolucaoMensal = Object.entries(mensalMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, vals]) => ({ mes, ...vals }));

    res.json({
      resumo: { total, concluidos, cancelados, agendados, emAndamento, receitaTotal },
      porStatus,
      porArea,
      evolucaoMensal,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/atendimentos/exportar
exports.exportar = (req, res) => {
  try {
    let data = loadData();

    const { busca, status, area, advogado, dataInicio, dataFim } = req.query;

    if (busca) {
      const termo = busca.toLowerCase();
      data = data.filter(a =>
        a.cliente.toLowerCase().includes(termo) ||
        a.advogado.toLowerCase().includes(termo) ||
        a.area.toLowerCase().includes(termo)
      );
    }
    if (status) data = data.filter(a => a.status === status);
    if (area) data = data.filter(a => a.area === area);
    if (advogado) data = data.filter(a => a.advogado === advogado);
    if (dataInicio) data = data.filter(a => a.data >= dataInicio);
    if (dataFim) data = data.filter(a => a.data <= dataFim);

    res.json({ data, total: data.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/atendimentos/:id
exports.buscarPorId = (req, res) => {
  try {
    const data = loadData();
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const item = data.find(a => a.id === id);
    if (!item) {
      return res.status(404).json({ error: `Atendimento ${id} não encontrado` });
    }

    res.json({ data: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/atendimentos/opcoes
exports.opcoes = (req, res) => {
  try {
    const data = loadData();
    const status = [...new Set(data.map(a => a.status))].sort();
    const areas = [...new Set(data.map(a => a.area))].sort();
    const advogados = [...new Set(data.map(a => a.advogado))].sort();
    res.json({ status, areas, advogados });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/atendimentos
exports.criar = (req, res) => {
  try {
    const data = loadData();
    const { cliente, advogado, area, tipo, status, data: dataAtend, hora, valor, observacoes } = req.body;

    if (!cliente || !advogado || !area || !tipo || !status || !dataAtend || !hora) {
      return res.status(400).json({ error: 'Campos obrigatórios: cliente, advogado, area, tipo, status, data, hora' });
    }

    const novoId = data.length > 0 ? Math.max(...data.map(a => a.id)) + 1 : 1;
    const novo = {
      id: novoId,
      cliente,
      advogado,
      area,
      tipo,
      status,
      data: dataAtend,
      hora,
      valor: valor ? parseFloat(valor) : 0,
      observacoes: observacoes || '',
    };

    data.unshift(novo);
    const fs = require('fs');
    const path = require('path');
    fs.writeFileSync(path.join(__dirname, '../data/atendimentos.json'), JSON.stringify(data, null, 2), 'utf-8');

    res.status(201).json({ data: novo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/atendimentos/:id
exports.atualizar = (req, res) => {
  try {
    const data = loadData();
    const id = parseInt(req.params.id);

    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const idx = data.findIndex(a => a.id === id);
    if (idx === -1) return res.status(404).json({ error: `Atendimento ${id} não encontrado` });

    const { cliente, advogado, area, tipo, status, data: dataAtend, hora, valor, observacoes } = req.body;

    data[idx] = {
      ...data[idx],
      ...(cliente !== undefined && { cliente }),
      ...(advogado !== undefined && { advogado }),
      ...(area !== undefined && { area }),
      ...(tipo !== undefined && { tipo }),
      ...(status !== undefined && { status }),
      ...(dataAtend !== undefined && { data: dataAtend }),
      ...(hora !== undefined && { hora }),
      ...(valor !== undefined && { valor: parseFloat(valor) }),
      ...(observacoes !== undefined && { observacoes }),
    };

    const fs = require('fs');
    const path = require('path');
    fs.writeFileSync(path.join(__dirname, '../data/atendimentos.json'), JSON.stringify(data, null, 2), 'utf-8');

    res.json({ data: data[idx] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
