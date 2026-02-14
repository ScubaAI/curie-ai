import Link from "next/link";
import {
  ShieldCheck,
  Activity,
  Brain,
  Stethoscope,
  Lock,
  Database,
  ArrowRight,
  Watch,
  FileText,
  Smartphone,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  const integrations = [
    { name: "Withings", category: "Wearables" },
    { name: "Garmin", category: "Deporte y frecuencia cardíaca" },
    { name: "Apple Health", category: "Ecosistema" },
    { name: "Oura", category: "Sueño y recuperación" },
    { name: "InBody", category: "Composición corporal" },
    { name: "SECA", category: "Análisis clínico" },
    { name: "Shearwater", category: "Telemetría de buceo" },
    { name: "Fitbit", category: "Actividad diaria" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Navbar simple y limpio */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Activity className="w-7 h-7 text-cyan-500" />
            <span className="font-semibold text-xl">Curie</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Protección de datos médicos
            </span>
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-500" />
              Encriptación completa
            </span>
          </div>
        </div>
      </nav>

      {/* Hero – limpio, directo, sin video pesado */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Izquierda: mensaje principal */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-sm">
              <Brain className="w-4 h-4" />
              Datos biométricos + historia clínica
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Tu médico ve lo que tú no notas
            </h1>

            <p className="text-xl text-slate-300 leading-relaxed max-w-xl">
              Curie reúne tus datos de wearables, básculas, laboratorios y buceo en un solo lugar.
              Tu médico recibe información completa y actualizada antes de cada consulta.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 pt-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-colors"
              >
                Comenzar gratis
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/doctor/register"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-slate-700 hover:border-cyan-600 text-slate-200 hover:text-white rounded-xl transition-colors"
              >
                <Stethoscope className="w-5 h-5" />
                Soy médico
              </Link>
            </div>

            <p className="text-sm text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Registro gratuito • Conexión de dispositivos en menos de 1 minuto
            </p>
          </div>

          {/* Derecha: mockup simple (puedes reemplazar por screenshot real) */}
          <div className="hidden lg:block relative">
            <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold">
                  JD
                </div>
                <div>
                  <div className="font-medium">Juan Doe</div>
                  <div className="text-sm text-slate-400">42 años</div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-xs text-slate-400 mb-1">Peso</div>
                    <div className="text-2xl font-bold text-white">78.5 kg</div>
                    <div className="text-sm text-emerald-400">↓ 0.7 kg</div>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-xs text-slate-400 mb-1">Grasa corporal</div>
                    <div className="text-2xl font-bold text-white">15.3%</div>
                    <div className="text-sm text-emerald-400">Mejorando</div>
                  </div>
                </div>

                <div className="p-4 bg-cyan-950/30 border border-cyan-900/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-cyan-400 mt-0.5" />
                    <div className="text-sm text-slate-300">
                      Sueño fragmentado + HRV bajo. Posible estrés elevado.
                      Sugerir revisión de cortisol en próxima consulta.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integraciones – más sobrio */}
      <section className="py-20 bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Conecta tus dispositivos médicos
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Sincronización automática con los equipos y wearables que ya usas.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {integrations.map((item, i) => (
              <div
                key={i}
                className="p-6 bg-slate-950 border border-slate-800 rounded-xl hover:border-cyan-800/50 transition-colors text-center"
              >
                <div className="text-2xl font-bold text-cyan-400 mb-2">
                  {item.name}
                </div>
                <p className="text-sm text-slate-400">{item.category}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-cyan-950/40 border border-cyan-900/50 text-cyan-300">
              <Smartphone className="w-5 h-5" />
              Conecta todo en menos de 1 minuto
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona – simple y claro */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Cómo funciona Curie
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { title: "Conecta", desc: "Vincula tus wearables y básculas en segundos" },
              { title: "Recopila", desc: "Tus datos de salud llegan automáticamente" },
              { title: "Analiza", desc: "Curie detecta patrones y riesgos tempranos" },
              { title: "Comparte", desc: "Tu médico recibe información actualizada" },
            ].map((step, i) => (
              <div key={i} className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center">
                  <span className="text-2xl font-bold text-cyan-400">{i + 1}</span>
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seguridad – confianza sin exagerar */}
      <section className="py-20 bg-slate-900 border-y border-slate-800">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-8">
                Tus datos médicos están protegidos
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Lock className="w-6 h-6 text-cyan-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">Encriptación completa</h4>
                    <p className="text-slate-400">Datos en reposo y en tránsito protegidos</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <ShieldCheck className="w-6 h-6 text-emerald-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">Cumplimiento normativo</h4>
                    <p className="text-slate-400">En proceso de alineación con estándares HIPAA y GDPR</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Database className="w-6 h-6 text-cyan-500 mt-1" />
                  <div>
                    <h4 className="font-semibold">Sin venta de datos</h4>
                    <p className="text-slate-400">Tu información nunca se comercializa</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-6">Compromiso de privacidad</h3>
              <p className="text-slate-300 mb-6">
                Solo tú y tu médico autorizado pueden acceder a tus datos.
                Usamos las mismas medidas de seguridad que instituciones financieras y hospitales.
              </p>
              <Link
                href="/privacy"
                className="text-cyan-400 hover:underline flex items-center gap-2"
              >
                Leer política de privacidad completa →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Empieza hoy mismo
          </h2>
          <p className="text-xl text-slate-300 mb-10">
            Registro gratuito. Sin tarjetas. Sin compromisos.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              href="/register"
              className="px-10 py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-colors text-lg"
            >
              Crear mi cuenta
            </Link>

            <Link
              href="/doctor/register"
              className="px-10 py-5 border border-slate-600 hover:border-cyan-600 text-slate-200 hover:text-white rounded-xl transition-colors text-lg"
            >
              Soy profesional de la salud
            </Link>
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="border-t border-slate-800 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Curie • Inteligencia médica con datos reales</p>
          <div className="mt-4 flex justify-center gap-8">
            <Link href="/privacy" className="hover:text-slate-300">Privacidad</Link>
            <Link href="/terms" className="hover:text-slate-300">Términos</Link>
            <Link href="/security" className="hover:text-slate-300">Seguridad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}