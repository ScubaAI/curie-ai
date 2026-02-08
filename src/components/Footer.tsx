'use client';

import { motion } from 'framer-motion';
import { Cpu, Activity, Waves, Shield, Database, Bluetooth, Wifi, Satellite } from 'lucide-react';
import MedicalDisclaimer from './MedicalDisclaimer';

interface DeviceRowProps {
  title: string;
  items: string[];
  color: string;
  icon: React.ReactNode;
  delay: number;
}

function DeviceRow({ title, items, color, icon, delay }: DeviceRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col gap-3"
    >
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className="text-xs font-semibold uppercase tracking-[0.2em]">{title}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={index}
            className="px-3 py-1 text-[10px] text-slate-400 bg-slate-900/50 border border-slate-800 rounded-full uppercase tracking-[0.1em]"
          >
            {item}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function Footer() {
  const poweredBy = [
    'Llama 3.3 70B',
    'GPT-4o',
    'Claude 3.5',
    'Gemini Pro',
    'Mistral Large',
    'Command R+'
  ];

  const medicalDevices = [
    'Nonin Medical',
    'Masimo',
    'Philips Healthcare',
    'Medtronic',
    'GE Healthcare',
    'Welch Allyn'
  ];

  const sportWearables = [
    'Whoop',
    'Oura Ring',
    'Garmin',
    'Fitbit',
    'Apple Watch',
    'Polar'
  ];

  const emerging = [
    'Neuralink',
    'Synchron',
    'BrainCo',
    'Kernel',
    'NextMind',
    'Emotiv'
  ];

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <DeviceRow
            title="Powered By"
            items={poweredBy}
            color="text-cyan-500"
            icon={<Cpu className="w-4 h-4" />}
            delay={0.1}
          />
          <DeviceRow
            title="Medical Devices"
            items={medicalDevices}
            color="text-emerald-500"
            icon={<Activity className="w-4 h-4" />}
            delay={0.2}
          />
          <DeviceRow
            title="Sport Wearables"
            items={sportWearables}
            color="text-amber-500"
            icon={<Waves className="w-4 h-4" />}
            delay={0.3}
          />
          <DeviceRow
            title="Emerging Tech"
            items={emerging}
            color="text-cyan-500"
            icon={<Satellite className="w-4 h-4" />}
            delay={0.4}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 pt-8 border-t border-slate-900"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6 text-slate-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-[0.15em]">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-[0.15em]">End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Bluetooth className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-[0.15em]">BLE 5.0</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-[0.15em]">WiFi 6E</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-600 uppercase tracking-[0.15em]">
              © 2025 Curie AI. All rights reserved.
            </div>
          </div>
        </motion.div>

        <MedicalDisclaimer />
      </div>
    </footer>
  );
}
