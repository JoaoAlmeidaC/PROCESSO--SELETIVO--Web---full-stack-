import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts';

const STATUS_COLORS = {
  'Concluído': '#22c55e',
  'Cancelado': '#ef4444',
  'Agendado': '#6366f1',
  'Em Andamento': '#f59e0b',
};

const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
function formatMes(mesStr) {
  const [, m] = mesStr.split('-');
  return MONTHS_PT[parseInt(m) - 1];
}

function ChartCard({ title, children }) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">{title}</h3>
      {children}
    </div>
  );
}

export default function DashboardCharts({ metricas }) {
  if (!metricas) return null;
  const { porStatus, evolucaoMensal, porArea } = metricas;

  const pieData = porStatus.map(s => ({ name: s.status, value: s.quantidade }));

  return (
    <div className="charts-grid">
      <ChartCard title="Distribuição por Status">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
              {pieData.map(entry => (
                <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip formatter={(v, n) => [v, n]} />
            <Legend
              formatter={(v) => <span style={{ fontSize: 12, color: '#64748b' }}>{v}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Evolução Mensal de Atendimentos">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={evolucaoMensal} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="mes" tickFormatter={formatMes} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
            <Tooltip labelFormatter={formatMes} formatter={(v) => [v, 'Atendimentos']} />
            <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Atendimentos por Área Jurídica">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={porArea} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="area" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={90} />
            <Tooltip formatter={(v) => [v, 'Atendimentos']} />
            <Bar dataKey="quantidade" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
