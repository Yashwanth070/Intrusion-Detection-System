import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { 
  HiShieldExclamation, 
  HiFire, 
  HiCheckBadge, 
  HiBolt, 
  HiArrowTrendingUp,
  HiCpuChip,
  HiArrowRight
} from 'react-icons/hi2';
import { useSocket } from '../hooks/useSocket';
import { useApi } from '../hooks/useApi';

// Register Chart.js components
ChartJS.register(...registerables);

// Dark theme defaults
ChartJS.defaults.color = '#94a3b8';
ChartJS.defaults.borderColor = 'rgba(148, 163, 184, 0.1)';
ChartJS.defaults.font.family = "'Inter', sans-serif";

const fallbackStats = {
  totalAlerts: 14829,
  activeThreats: 142,
  detectionRate: 99.93,
  avgInferenceTime: 4.8
};

const fallbackTimeline = {
  labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', 'Now'],
  data: [120, 85, 45, 62, 180, 420, 580, 710, 620, 890, 1140, 950, 780]
};

const attackClasses = [
  'Normal', 'Backdoor', 'DDoS', 'DoS', 'Injection', 
  'MITM', 'Password', 'Ransomware', 'Scanning', 'XSS'
];

const fallbackAttackDist = {
  labels: attackClasses,
  counts: [8420, 310, 2450, 1890, 420, 180, 650, 290, 920, 310]
};

const initialAlerts = [
  { id: 'ALT-9401', timestamp: '14:48:22', attackType: 'DDoS', severity: 'critical', srcIp: '192.168.1.105', dstIp: '192.168.1.1', protocol: 'TCP', model: 'LightGBM', confidence: 99.4 },
  { id: 'ALT-9400', timestamp: '14:47:05', attackType: 'Scanning', severity: 'medium', srcIp: '192.168.1.189', dstIp: '192.168.1.42', protocol: 'UDP', model: 'XGBoost', confidence: 98.1 },
  { id: 'ALT-9399', timestamp: '14:45:19', attackType: 'Injection', severity: 'high', srcIp: '10.0.0.84', dstIp: '192.168.1.10', protocol: 'HTTP', model: 'LightGBM', confidence: 99.7 },
  { id: 'ALT-9398', timestamp: '14:44:31', attackType: 'Password', severity: 'high', srcIp: '192.168.1.202', dstIp: '192.168.1.5', protocol: 'MQTT', model: 'Random Forest', confidence: 97.6 },
  { id: 'ALT-9397', timestamp: '14:42:10', attackType: 'DoS', severity: 'critical', srcIp: '192.168.1.77', dstIp: '192.168.1.1', protocol: 'ICMP', model: 'Decision Tree', confidence: 96.9 },
  { id: 'ALT-9396', timestamp: '14:40:55', attackType: 'Backdoor', severity: 'critical', srcIp: '172.16.0.44', dstIp: '192.168.1.15', protocol: 'TCP', model: 'LightGBM', confidence: 99.8 },
  { id: 'ALT-9395', timestamp: '14:38:12', attackType: 'MITM', severity: 'medium', srcIp: '192.168.1.99', dstIp: '192.168.1.20', protocol: 'ARP', model: 'MLP', confidence: 94.2 },
  { id: 'ALT-9394', timestamp: '14:36:44', attackType: 'XSS', severity: 'medium', srcIp: '10.0.0.12', dstIp: '192.168.1.10', protocol: 'HTTP', model: 'LightGBM', confidence: 98.9 },
  { id: 'ALT-9393', timestamp: '14:33:18', attackType: 'Ransomware', severity: 'critical', srcIp: '192.168.1.112', dstIp: '192.168.1.30', protocol: 'TCP', model: 'XGBoost', confidence: 99.5 },
  { id: 'ALT-9392', timestamp: '14:30:02', attackType: 'Scanning', severity: 'low', srcIp: '192.168.1.50', dstIp: '192.168.1.80', protocol: 'UDP', model: 'Decision Tree', confidence: 95.3 }
];

const initialDevices = {
  arduinoMega: {
    name: 'Arduino Mega 2560',
    arch: 'AVR 8-bit @ 16 MHz',
    online: true,
    cpu: 78,
    memory: 84,
    flashUsage: '184 KB / 256 KB',
    sramUsage: '6.8 KB / 8 KB',
    inferenceTime: '28.4 ms',
    temp: '41°C',
    packetsSec: 142
  },
  esp32c3: {
    name: 'ESP32-C3 Mini',
    arch: 'RISC-V 32-bit @ 160 MHz',
    online: true,
    cpu: 28,
    memory: 34,
    flashUsage: '640 KB / 4 MB',
    sramUsage: '78 KB / 400 KB',
    inferenceTime: '4.2 ms',
    temp: '36°C',
    packetsSec: 960
  }
};

function MiniGauge({ value, max = 100, label, color }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(value || 0, 0), max);
  const offset = circumference - (pct / max) * circumference;

  return (
    <div className="gauge">
      <div className="gauge-svg-wrap">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle 
            cx="36" 
            cy="36" 
            r={radius} 
            fill="none" 
            stroke="rgba(148,163,184,0.12)" 
            strokeWidth="5" 
          />
          <circle 
            cx="36" 
            cy="36" 
            r={radius} 
            fill="none" 
            stroke={color} 
            strokeWidth="5" 
            strokeDasharray={circumference} 
            strokeDashoffset={offset}
            strokeLinecap="round" 
            transform="rotate(-90 36 36)"
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} 
          />
        </svg>
        <div className="gauge-center-content">
          <div className="gauge-value" style={{ fontSize: '0.95rem' }}>{Math.round(pct)}%</div>
        </div>
      </div>
      <div className="gauge-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { isConnected, subscribe } = useSocket();
  const { data: statsData } = useApi('/alerts/stats', { fallbackData: fallbackStats });
  const { data: timelineData } = useApi('/alerts/timeline', { fallbackData: fallbackTimeline });
  const { data: attackDistData } = useApi('/alerts/distribution', { fallbackData: fallbackAttackDist });
  const { data: devicesData } = useApi('/devices', { fallbackData: initialDevices });

  const [alerts, setAlerts] = useState(initialAlerts);
  const [devices, setDevices] = useState(initialDevices);

  // Sync initial devices from API (handles both array and object response)
  useEffect(() => {
    if (devicesData) {
      if (Array.isArray(devicesData)) {
        const mega = devicesData.find(d => d.deviceId?.includes('mega')) || {};
        const esp = devicesData.find(d => d.deviceId?.includes('esp')) || {};
        setDevices(prev => ({
          arduinoMega: {
            ...prev.arduinoMega,
            name: mega.deviceName || prev.arduinoMega?.name,
            arch: mega.architecture || prev.arduinoMega?.arch,
            cpu: Math.round(mega.cpuUsage ?? prev.arduinoMega?.cpu ?? 78),
            memory: Math.round(mega.memoryUsage ?? prev.arduinoMega?.memory ?? 84),
            inferenceTime: mega.inferenceTimeUs ? `${(mega.inferenceTimeUs / 1000).toFixed(1)} ms` : prev.arduinoMega?.inferenceTime,
            temp: mega.temperature ? `${mega.temperature}°C` : prev.arduinoMega?.temp,
          },
          esp32c3: {
            ...prev.esp32c3,
            name: esp.deviceName || prev.esp32c3?.name,
            arch: esp.architecture || prev.esp32c3?.arch,
            cpu: Math.round(esp.cpuUsage ?? prev.esp32c3?.cpu ?? 28),
            memory: Math.round(esp.memoryUsage ?? prev.esp32c3?.memory ?? 34),
            inferenceTime: esp.inferenceTimeUs ? `${(esp.inferenceTimeUs / 1000).toFixed(1)} ms` : prev.esp32c3?.inferenceTime,
            temp: esp.temperature ? `${esp.temperature}°C` : prev.esp32c3?.temp,
            packetsSec: esp.packetsProcessed ? Math.round(esp.packetsProcessed / 10) : prev.esp32c3?.packetsSec
          }
        }));
      } else if (typeof devicesData === 'object') {
        setDevices(prev => ({ ...prev, ...devicesData }));
      }
    }
  }, [devicesData]);

  // Subscribe to real-time Socket.IO events
  useEffect(() => {
    const unsubAlert = subscribe('newAlert', (newAlert) => {
      if (!newAlert) return;
      const normalized = {
        id: newAlert._id || newAlert.id || `ALT-${Date.now()}`,
        timestamp: newAlert.timestamp ? new Date(newAlert.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
        attackType: newAlert.attackType || 'Normal',
        severity: (newAlert.severity || 'info').toLowerCase(),
        srcIp: newAlert.sourceIP || newAlert.srcIp || '10.0.0.1',
        dstIp: newAlert.destIP || newAlert.dstIp || '192.168.1.1',
        protocol: newAlert.protocol || 'TCP',
        model: newAlert.modelUsed || newAlert.model || 'LightGBM',
        confidence: typeof newAlert.confidence === 'number' 
          ? (newAlert.confidence > 1 ? Math.round(newAlert.confidence) : Math.round(newAlert.confidence * 100)) 
          : 99,
        isNew: true
      };
      setAlerts((prev) => [normalized, ...prev.slice(0, 14)]);
    });

    const unsubMetrics = subscribe('deviceMetrics', (metrics) => {
      if (Array.isArray(metrics)) {
        const mega = metrics.find(d => d.deviceId?.includes('mega'));
        const esp = metrics.find(d => d.deviceId?.includes('esp'));
        setDevices((prev) => ({
          arduinoMega: mega ? {
            ...prev.arduinoMega,
            cpu: Math.round(mega.cpuUsage ?? prev.arduinoMega.cpu),
            memory: Math.round(mega.memoryUsage ?? prev.arduinoMega.memory),
            inferenceTime: mega.inferenceTimeUs ? `${(mega.inferenceTimeUs / 1000).toFixed(1)} ms` : prev.arduinoMega.inferenceTime,
            temp: mega.temperature ? `${mega.temperature}°C` : prev.arduinoMega.temp,
          } : prev.arduinoMega,
          esp32c3: esp ? {
            ...prev.esp32c3,
            cpu: Math.round(esp.cpuUsage ?? prev.esp32c3.cpu),
            memory: Math.round(esp.memoryUsage ?? prev.esp32c3.memory),
            inferenceTime: esp.inferenceTimeUs ? `${(esp.inferenceTimeUs / 1000).toFixed(1)} ms` : prev.esp32c3.inferenceTime,
            temp: esp.temperature ? `${esp.temperature}°C` : prev.esp32c3.temp,
            packetsSec: esp.packetsProcessed ? Math.round(esp.packetsProcessed / 10) : prev.esp32c3.packetsSec
          } : prev.esp32c3
        }));
      }
    });

    return () => {
      unsubAlert?.();
      unsubMetrics?.();
    };
  }, [subscribe]);

  // Live simulation ticker for preview/standalone deployments (e.g. Vercel demo) when socket is not connected
  useEffect(() => {
    if (isConnected) return;

    const attackTypes = ['DDoS', 'Scanning', 'Injection', 'Password', 'DoS', 'Backdoor', 'MITM', 'XSS', 'Ransomware'];
    const severities = ['critical', 'high', 'medium', 'low'];
    const models = ['LightGBM', 'XGBoost', 'Random Forest', 'Decision Tree', 'MLP'];
    const protocols = ['TCP', 'UDP', 'HTTP', 'MQTT', 'ICMP'];

    const interval = setInterval(() => {
      const attack = attackTypes[Math.floor(Math.random() * attackTypes.length)];
      const simAlert = {
        id: `ALT-${Math.floor(9400 + Math.random() * 599)}`,
        timestamp: new Date().toLocaleTimeString(),
        attackType: attack,
        severity: attack === 'DDoS' || attack === 'Backdoor' || attack === 'Ransomware' ? 'critical' : severities[Math.floor(Math.random() * severities.length)],
        srcIp: `192.168.1.${Math.floor(2 + Math.random() * 240)}`,
        dstIp: `192.168.1.${Math.floor(1 + Math.random() * 30)}`,
        protocol: protocols[Math.floor(Math.random() * protocols.length)],
        model: models[Math.floor(Math.random() * models.length)],
        confidence: +(95 + Math.random() * 4.9).toFixed(1),
        isNew: true
      };

      setAlerts(prev => [simAlert, ...prev.slice(0, 14)]);

      // Natural variance in edge hardware telemetry
      setDevices(prev => ({
        arduinoMega: {
          ...prev.arduinoMega,
          cpu: Math.min(95, Math.max(68, Math.round(prev.arduinoMega.cpu + (Math.random() * 6 - 3)))),
          memory: Math.min(92, Math.max(78, Math.round(prev.arduinoMega.memory + (Math.random() * 2 - 1)))),
          temp: `${Math.round(40 + Math.random() * 3)}°C`,
          packetsSec: Math.round(130 + Math.random() * 25)
        },
        esp32c3: {
          ...prev.esp32c3,
          cpu: Math.min(48, Math.max(22, Math.round(prev.esp32c3.cpu + (Math.random() * 6 - 3)))),
          memory: Math.min(42, Math.max(28, Math.round(prev.esp32c3.memory + (Math.random() * 2 - 1)))),
          temp: `${Math.round(35 + Math.random() * 3)}°C`,
          packetsSec: Math.round(920 + Math.random() * 80)
        }
      }));
    }, 3500);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Safe Stats values
  const stats = statsData || fallbackStats;

  // Safe Timeline values (handling both Array of items and Object {labels, data})
  const timelineLabels = Array.isArray(timelineData)
    ? timelineData.map(d => (d.hour ? new Date(d.hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''))
    : (timelineData?.labels || fallbackTimeline.labels);

  const timelineCounts = Array.isArray(timelineData)
    ? timelineData.map(d => d.count || 0)
    : (timelineData?.data || fallbackTimeline.data);

  // Safe Attack Distribution values
  const attackDistLabels = attackDistData?.labels || (
    statsData?.alertsByType?.length 
      ? statsData.alertsByType.map(a => a._id) 
      : fallbackAttackDist.labels
  );
  const attackDistCounts = attackDistData?.counts || (
    statsData?.alertsByType?.length 
      ? statsData.alertsByType.map(a => a.count) 
      : fallbackAttackDist.counts
  );

  // Chart: Alert Timeline Line Data
  const lineChartData = {
    labels: timelineLabels,
    datasets: [
      {
        label: 'Threat Events',
        data: timelineCounts,
        borderColor: '#6366f1',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart || {};
          if (!chartArea || !ctx) {
            return 'rgba(99, 102, 241, 0.25)';
          }
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.38,
        borderWidth: 2.5,
        pointBackgroundColor: '#818cf8',
        pointBorderColor: '#060b18',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.05)' },
        ticks: { color: '#64748b', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.08)' },
        ticks: { color: '#64748b', font: { size: 11 } }
      }
    }
  };

  const doughnutColors = [
    '#10b981', // Normal
    '#f43f5e', // Backdoor
    '#ef4444', // DDoS
    '#f97316', // DoS
    '#eab308', // Injection
    '#8b5cf6', // MITM
    '#ec4899', // Password
    '#d946ef', // Ransomware
    '#06b6d4', // Scanning
    '#3b82f6'  // XSS
  ];

  const doughnutData = {
    labels: attackDistLabels,
    datasets: [
      {
        data: attackDistCounts,
        backgroundColor: doughnutColors,
        borderColor: '#0d1322',
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#94a3b8',
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          font: { size: 11 },
          padding: 12
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8
      }
    }
  };

  const getSeverityBadgeClass = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical': return 'badge-critical';
      case 'high': return 'badge-high';
      case 'medium': return 'badge-medium';
      case 'low': return 'badge-low';
      default: return 'badge-info';
    }
  };

  return (
    <>
      {/* Header */}
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">
            Intrusion Detection Overview
          </h1>
          <p className="page-subtitle">
            Real-time IoT network telemetry & lightweight machine learning edge inference
          </p>
        </div>
        <div className="status-indicator">
          <span className={`status-dot ${isConnected ? 'status-dot-active' : 'status-dot-offline'}`} />
          <span style={{ color: isConnected ? 'var(--accent-success)' : 'var(--text-muted)', fontSize: '0.85rem' }}>
            {isConnected ? 'Real-Time Stream Online' : 'Connecting to Edge Node...'}
          </span>
        </div>
      </div>

      {/* Top Section — 4 KPI Cards */}
      <div className="grid-4">
        {/* KPI 1: Total Alerts */}
        <div className="card kpi-card animate-in stagger-1">
          <div className="kpi-top">
            <div className="kpi-icon-wrap icon-red">
              <HiShieldExclamation />
            </div>
            <span className="kpi-trend trend-up">
              <HiArrowTrendingUp /> Live Sync
            </span>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-value gradient-red">
              {stats.totalAlerts?.toLocaleString() || '14,829'}
            </div>
            <div className="kpi-label">Total Threat Events (24h)</div>
          </div>
        </div>

        {/* KPI 2: Active Threats */}
        <div className="card kpi-card animate-in stagger-2">
          <div className="kpi-top">
            <div className="kpi-icon-wrap icon-amber">
              <HiFire />
            </div>
            <span className="kpi-trend trend-down">
              Past 24h
            </span>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-value gradient-amber">
              {stats.anomalyCount || stats.activeThreats || '142'}
            </div>
            <div className="kpi-label">Detected Anomalies / Attacks</div>
          </div>
        </div>

        {/* KPI 3: Detection Rate */}
        <div className="card kpi-card animate-in stagger-3">
          <div className="kpi-top">
            <div className="kpi-icon-wrap icon-green">
              <HiCheckBadge />
            </div>
            <span className="kpi-trend trend-up">
              LightGBM Peak
            </span>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-value gradient-green">
              {stats.detectionRate || '99.93'}%
            </div>
            <div className="kpi-label">Model Detection Accuracy (F1)</div>
          </div>
        </div>

        {/* KPI 4: Avg Inference Time */}
        <div className="card kpi-card animate-in stagger-4">
          <div className="kpi-top">
            <div className="kpi-icon-wrap icon-cyan">
              <HiBolt />
            </div>
            <span className="kpi-trend trend-neutral">
              ESP32-C3 Edge
            </span>
          </div>
          <div className="kpi-bottom">
            <div className="kpi-value gradient-cyan">
              {devices.esp32c3?.inferenceTime || '4.2 ms'}
            </div>
            <div className="kpi-label">Avg MCU Inference Latency</div>
          </div>
        </div>
      </div>

      {/* Middle Section — 2 column grid */}
      <div className="grid-2">
        {/* LEFT: Alert Timeline */}
        <div className="card animate-in stagger-2">
          <div className="card-header">
            <div>
              <div className="card-title">Threat Velocity Timeline</div>
              <div className="card-subtitle">Aggregated threat occurrences over last 24 hours</div>
            </div>
            <span className="badge badge-critical">Active Telemetry</span>
          </div>
          <div className="chart-container">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* RIGHT: Attack Distribution */}
        <div className="card animate-in stagger-3">
          <div className="card-header">
            <div>
              <div className="card-title">TON_IoT Attack Distribution</div>
              <div className="card-subtitle">Class breakdown across 10 network flow categories</div>
            </div>
            <span className="badge badge-low">Multi-Class</span>
          </div>
          <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Section — 2 column grid */}
      <div className="grid-2">
        {/* LEFT: Live Alert Feed */}
        <div className="card animate-in stagger-3" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div>
              <div className="card-title">
                <span className="status-dot status-dot-active" style={{ marginRight: 4 }} />
                Real-Time Intrusion Feed
              </div>
              <div className="card-subtitle">Latest 15 classified network packets</div>
            </div>
            <span className="badge badge-normal">Auto-streaming</span>
          </div>

          <div style={{ maxHeight: '360px', overflowY: 'auto', paddingRight: '4px' }}>
            {alerts.map((alert, idx) => (
              <div key={alert.id || alert._id || idx} className={`alert-feed-item ${alert.isNew ? 'new-item' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`badge ${getSeverityBadgeClass(alert.severity)}`}>
                    {alert.attackType}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{alert.srcIp || alert.sourceIP}</span>
                      <HiArrowRight style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} />
                      <span>{alert.dstIp || alert.destIP}</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', gap: 8, marginTop: 2 }}>
                      <span>{alert.protocol}</span>
                      <span>•</span>
                      <span>{alert.model || alert.modelUsed}</span>
                      <span>•</span>
                      <span style={{ color: 'var(--accent-secondary)' }}>
                        {typeof alert.confidence === 'number' ? (alert.confidence > 1 ? Math.round(alert.confidence) : Math.round(alert.confidence * 100)) : 99}% conf
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                  {alert.timestamp ? (typeof alert.timestamp === 'string' && alert.timestamp.length > 8 ? new Date(alert.timestamp).toLocaleTimeString() : alert.timestamp) : 'Just now'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Device Status */}
        <div className="card animate-in stagger-4" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card-header" style={{ marginBottom: 0 }}>
            <div>
              <div className="card-title">
                <HiCpuChip style={{ color: 'var(--accent-secondary)' }} />
                Hardware Edge Node Telemetry
              </div>
              <div className="card-subtitle">Comparative deployment on AVR ATmega vs RISC-V</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Device 1: Arduino Mega */}
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.45)', 
              borderRadius: 'var(--radius-md)', 
              padding: '16px 20px', 
              border: '1px solid rgba(99, 102, 241, 0.12)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {devices.arduinoMega?.name}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    {devices.arduinoMega?.arch}
                  </div>
                </div>
                <span className="badge badge-normal">Online</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, alignItems: 'center' }}>
                <MiniGauge value={devices.arduinoMega?.cpu || 78} label="CPU Load" color="var(--accent-warning)" />
                <MiniGauge value={devices.arduinoMega?.memory || 84} label="SRAM Usage" color="var(--accent-danger)" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Latency: </span>
                    <strong style={{ color: 'var(--accent-warning)' }}>{devices.arduinoMega?.inferenceTime}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Temp: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{devices.arduinoMega?.temp}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Flash: </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{devices.arduinoMega?.flashUsage}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Device 2: ESP32-C3 */}
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.45)', 
              borderRadius: 'var(--radius-md)', 
              padding: '16px 20px', 
              border: '1px solid rgba(34, 211, 238, 0.18)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {devices.esp32c3?.name}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--accent-secondary)' }}>
                    {devices.esp32c3?.arch} • 6.8× Acceleration
                  </div>
                </div>
                <span className="badge badge-normal">Ultra Efficient</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, alignItems: 'center' }}>
                <MiniGauge value={devices.esp32c3?.cpu || 28} label="CPU Load" color="var(--accent-secondary)" />
                <MiniGauge value={devices.esp32c3?.memory || 34} label="RAM Usage" color="var(--accent-success)" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Latency: </span>
                    <strong style={{ color: 'var(--accent-success)' }}>{devices.esp32c3?.inferenceTime}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Temp: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{devices.esp32c3?.temp}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Throughput: </span>
                    <span style={{ color: 'var(--accent-cyan)' }}>{devices.esp32c3?.packetsSec} pkts/s</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
