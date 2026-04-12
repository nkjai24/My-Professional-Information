import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Mic, Brain } from "lucide-react";

export default function Landing() {

  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 via-white to-indigo-50 relative overflow-hidden">

      {/* floating glow backgrounds */}

      <div className="absolute w-[600px] h-[600px] bg-teal-200 rounded-full blur-3xl opacity-30 top-[-100px] left-[-100px]"></div>

      <div className="absolute w-[500px] h-[500px] bg-indigo-200 rounded-full blur-3xl opacity-30 bottom-[-100px] right-[-100px]"></div>


      {/* NAVBAR */}

      <nav className="flex justify-between items-center px-10 py-6 bg-white/80 backdrop-blur-md shadow-sm relative z-10">

        <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
          Smart Teacher AI
        </h1>

        <button
          onClick={() => navigate("/login")}
          className="px-5 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-full shadow hover:scale-105 transition"
        >
          Login
        </button>

      </nav>


      {/* HERO */}

      <div className="flex flex-1 items-center justify-center px-6 relative z-10">

        <div className="text-center max-w-3xl">

          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent"
          >
            AI Powered Teaching Platform
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-lg text-gray-600"
          >
            Upload PDFs, generate lessons, ask questions and learn with AI voice explanations.
          </motion.p>

          <motion.button
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7 }}
            onClick={() => navigate("/login")}
            className="mt-10 px-8 py-3 bg-gradient-to-r from-teal-500 to-indigo-600 text-white rounded-full text-lg shadow-lg hover:scale-105 transition"
          >
            Get Started
          </motion.button>

        </div>

      </div>


      {/* FEATURES */}

      <section className="py-20 px-10 bg-white relative z-10">

        <h2 className="text-3xl font-bold text-center mb-14">
          Powerful Learning Features
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">

          <div className="p-6 rounded-xl shadow hover:shadow-xl transition bg-gray-50">
            <BookOpen className="text-teal-600 mb-4" size={40} />
            <h3 className="text-lg font-semibold">AI Lesson Generator</h3>
            <p className="text-gray-600 mt-2">
              Automatically generate structured lessons using advanced AI.
            </p>
          </div>

          <div className="p-6 rounded-xl shadow hover:shadow-xl transition bg-gray-50">
            <Mic className="text-indigo-600 mb-4" size={40} />
            <h3 className="text-lg font-semibold">Voice Learning</h3>
            <p className="text-gray-600 mt-2">
              Listen to AI voice explanations to enhance learning.
            </p>
          </div>

          <div className="p-6 rounded-xl shadow hover:shadow-xl transition bg-gray-50">
            <Brain className="text-teal-600 mb-4" size={40} />
            <h3 className="text-lg font-semibold">Smart AI Assistant</h3>
            <p className="text-gray-600 mt-2">
              Ask questions and receive intelligent answers instantly.
            </p>
          </div>

        </div>

      </section>


      {/* FOOTER */}

      <footer className="text-center py-6 text-gray-500 text-sm relative z-10">
        © {new Date().getFullYear()} Smart Teacher AI
      </footer>

    </div>
  );
}