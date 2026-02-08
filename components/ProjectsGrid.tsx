'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Github, ExternalLink } from 'lucide-react'

const projects = [
  {
    id: 1,
    title: 'Neural Interface',
    category: 'Web Experience',
    description: 'An immersive 3D experience exploring the intersection of AI and human consciousness.',
    tech: ['Three.js', 'WebGL', 'GSAP'],
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    id: 2,
    title: 'Quantum Dashboard',
    category: 'Product Design',
    description: 'Real-time data visualization platform for quantum computing research.',
    tech: ['React', 'D3.js', 'WebSockets'],
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 3,
    title: 'Synth Studio',
    category: 'Creative Tool',
    description: 'Browser-based modular synthesizer with visual programming interface.',
    tech: ['Web Audio', 'Canvas', 'TypeScript'],
    gradient: 'from-orange-500/20 to-red-500/20',
  },
  {
    id: 4,
    title: 'Nexus Commerce',
    category: 'E-Commerce',
    description: 'Next-gen shopping experience with AR try-on and AI recommendations.',
    tech: ['Next.js', 'TensorFlow', 'Stripe'],
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 }
}

export default function ProjectsGrid() {
  return (
    <section className="relative min-h-screen bg-[#0a0a0a] py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-6xl md:text-8xl font-black text-white mb-6">
            Featured<br />Projects
          </h2>
          <p className="text-xl text-white/60 max-w-2xl">
            A curated selection of my recent work spanning web experiences, product design, and creative coding.
          </p>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={item}
              whileHover={{ scale: 1.02 }}
              className="group relative"
            >
              <div className={`
                relative p-8 md:p-10 rounded-3xl overflow-hidden
                bg-gradient-to-br ${project.gradient}
                backdrop-blur-xl border border-white/10
                transition-all duration-500
                hover:border-white/30 hover:shadow-2xl hover:shadow-white/10
              `}>
                
                {/* Gradient Orb Effect */}
                <div className={`
                  absolute -right-20 -top-20 w-60 h-60 rounded-full 
                  bg-gradient-to-br ${project.gradient} blur-3xl opacity-50
                  group-hover:opacity-70 transition-opacity duration-500
                `} />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <span className="text-white/50 text-sm font-medium tracking-wider uppercase">
                      {project.category}
                    </span>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 45 }}
                      className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center
                                 border border-white/20 cursor-pointer"
                    >
                      <ArrowUpRight className="w-5 h-5 text-white" />
                    </motion.div>
                  </div>

                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {project.title}
                  </h3>

                  <p className="text-white/70 text-lg mb-6 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs font-medium text-white/80 
                                   bg-white/5 backdrop-blur-sm rounded-full border border-white/10"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 text-white font-medium"
                    >
                      View Project
                      <ExternalLink className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="w-8 h-8 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center
                                 border border-white/10"
                    >
                      <Github className="w-4 h-4 text-white/70" />
                    </motion.button>
                  </div>
                </div>

                {/* Glass morphism overlay on hover */}
                <div className="
                  absolute inset-0 bg-gradient-to-t from-black/20 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500
                " />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 text-center"
        >
          <p className="text-white/60 mb-6">Interested in collaborating?</p>
          <motion.a
            href="mailto:zqtioncontact@gmail.com"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="
              inline-block px-8 py-4 bg-white text-black font-bold rounded-full
              hover:shadow-2xl hover:shadow-white/20
              transition-all duration-300
            "
          >
            Let&apos;s Talk
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
