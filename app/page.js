"use client"

import { BarChart3, Clock, FileText, Shield, Users, Download, Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { SignUpButton, SignInButton, SignedIn, SignedOut, useAuth } from "@clerk/nextjs"
import ModeToggle from "@/components/ui/Toogle"
import { motion } from "framer-motion"
import { redirect } from "next/navigation"

export default function LandingPage() {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  }

  const textReveal = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: [0.215, 0.61, 0.355, 1],
      },
    }),
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const cardHover = {
    rest: { scale: 1, boxShadow: "0px 0px 0px rgba(0,0,0,0.1)" },
    hover: {
      scale: 1.03,
      boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
  }

  const { userId = null} = useAuth();
  if( userId != null) redirect("/dashboard");
  
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md"
      >
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <Image src="/sam2.png" className="ml-3 w-auto" alt="logo" width={120} height={60} />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                How It Works
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
                Testimonials
              </Link>
            </motion.div>
          </nav>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <SignedIn>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  className="text-sm mr-3 font-medium bg-primary text-white py-3 rounded-lg px-5 hover:bg-primary/90 transition-colors"
                  href="/dashboard"
                >
                  Dashboard
                </Link>
              </motion.div>
            </SignedIn>
            <SignedOut>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <SignInButton className="text-sm mr-3 font-medium bg-primary text-white py-3 rounded-lg px-5 hover:bg-primary/90 transition-colors"></SignInButton>
              </motion.div>
            </SignedOut>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-4">
                <motion.h1
                  custom={0}
                  variants={textReveal}
                  className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
                >
                  Simplify Student Attendance Tracking
                </motion.h1>
                <motion.p custom={1} variants={textReveal} className="max-w-[600px] text-muted-foreground md:text-xl">
                  Streamline your attendance process with our intuitive platform. Save time, improve accuracy, and gain
                  valuable insights into student attendance patterns.
                </motion.p>
                <motion.div custom={2} variants={textReveal} className="flex flex-col sm:flex-row gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <SignUpButton className="text-sm font-medium bg-primary text-white py-3 rounded-lg px-5 hover:bg-primary/90 transition-colors shadow-lg"></SignUpButton>
                  </motion.div>
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative h-[320px] w-full rounded-xl overflow-hidden shadow-2xl"
              >
                <Image src="/image45.png" alt="Student attendance dashboard" fill className="object-cover" priority />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {[
                { value: "98%", label: "Accuracy Rate" },
                { value: "500+", label: "Schools" },
                { value: "75%", label: "Time Saved" },
                { value: "1M+", label: "Students Tracked" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  variants={textReveal}
                  className="flex flex-col items-center text-center"
                >
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
                  >
                    {stat.value}
                  </motion.span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
              className="flex flex-col items-center justify-center space-y-4 text-center"
            >
              <div className="space-y-2">
                <motion.h2
                  custom={0}
                  variants={textReveal}
                  className="text-3xl font-bold tracking-tighter md:text-4xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
                >
                  Powerful Features for Attendance Management
                </motion.h2>
                <motion.p custom={1} variants={textReveal} className="max-w-[700px] text-muted-foreground md:text-xl">
                  Everything you need to track, analyze, and improve student attendance
                </motion.p>
              </div>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12"
            >
              {[
                {
                  icon: Clock,
                  title: "Real-time Tracking",
                  description: "Monitor attendance in real-time with instant updates and notifications",
                },
                {
                  icon: BarChart3,
                  title: "Advanced Analytics",
                  description: "Gain insights with detailed reports and attendance pattern analysis",
                },
                {
                  icon: Download,
                  title: "Download Report",
                  description: "Download student attendance report directly from the platform",
                },
                {
                  icon: FileText,
                  title: "Custom Reports",
                  description: "Generate customized reports for different stakeholders and purposes",
                },
                {
                  icon: Shield,
                  title: "Secure Data",
                  description: "Keep student information safe with enterprise-grade security",
                },
                {
                  icon: Users,
                  title: "User Friendly",
                  description: "We provide an easy to use platform that will enable you to take attendance",
                },
                {
                  icon: Mail,
                  title: "Send Notification",
                  description: "Send Gmail notifications to single or multiple student and guardians about attendance status",
                },

              ].map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={index}
                    custom={index}
                    variants={cardHover}
                    whileHover="hover"
                    initial="rest"
                    animate="rest"
                    className="flex flex-col items-center space-y-2 border rounded-lg p-6 bg-background shadow-sm hover:shadow-lg transition-all"
                  >
                    <motion.div
                      initial={{ rotateY: 0 }}
                      whileHover={{ rotateY: 180 }}
                      transition={{ duration: 0.6 }}
                      className="mb-2"
                    >
                      <Icon className="h-12 w-12 text-primary" />
                    </motion.div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground text-center">{feature.description}</p>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
              className="flex flex-col items-center justify-center space-y-4 text-center"
            >
              <div className="space-y-2">
                <motion.h2
                  custom={0}
                  variants={textReveal}
                  className="text-3xl font-bold tracking-tighter md:text-4xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
                >
                  How SAMS Works
                </motion.h2>
                <motion.p custom={1} variants={textReveal} className="max-w-[700px] text-muted-foreground md:text-xl">
                  A simple, three-step process to transform your attendance management
                </motion.p>
              </div>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
            >
              {[
                { step: 1, title: "Sign Up or Sign In", description: "Before you are able to access our application you need to sign up or sign in." },
                { step: 2, title: "Set Up Your Classes", description: "Add student data and create classes" },
                { step: 3, title: "Register Students' Face ID", description: "this Option allows you to register students for face ID attendance , Reminder this optional." },
                { step: 4, title: "Take Attendance", description: "Mark attendance with just a few clicks Or with face ID" },
                {
                  step: 5,
                  title: "Monitor & Analyze",
                  description: "Access reports, track trends, and take action based on attendance data",
                },
                {
                  step: 6,
                  title: "Download Reports",
                  description: "Download attendance reports for your records or share with stakeholders",
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  variants={textReveal}
                  className="relative flex flex-col items-center space-y-2 p-6"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold shadow-lg"
                  >
                    {step.step}
                  </motion.div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground text-center">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
              className="flex flex-col items-center justify-center space-y-4 text-center"
            >
              <div className="space-y-2">
                <motion.h2
                  custom={0}
                  variants={textReveal}
                  className="text-3xl font-bold tracking-tighter md:text-4xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
                >
                  What Educators Are Saying
                </motion.h2>
                <motion.p custom={1} variants={textReveal} className="max-w-[700px] text-muted-foreground md:text-xl">
                  Hear from schools and teachers who have transformed their attendance process
                </motion.p>
              </div>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
            >
              {[
                {
                  name: "Sarah Johnson",
                  role: "Principal, Lincoln High School",
                  quote:
                    "AttendTrack has revolutionized how we monitor student attendance. We've seen a 15% improvement in attendance rates since implementation.",
                },
                {
                  name: "Michael Chen",
                  role: "Teacher, Westview Middle School",
                  quote:
                    "The time I save on administrative tasks lets me focus more on teaching. The automated notifications to parents have also improved communication.",
                },
                {
                  name: "Lisa Rodriguez",
                  role: "District Administrator, Oakwood Schools",
                  quote:
                    "The district-wide analytics have been invaluable for our strategic planning. We can now identify trends and address issues proactively.",
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  variants={textReveal}
                  whileHover={{ y: -10 }}
                  className="flex flex-col space-y-4 border rounded-lg p-6 bg-background shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                      <Image src="/icon.png" alt="icon" width={30} height={30} />
                    </motion.div>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">"{testimonial.quote}"</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-gray-950 py-6 md:py-0">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-24 px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2"
          >
            <Image src="/sam2.png" className="ml-3 w-auto" alt="logo" width={120} height={60} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col md:flex-row items-center gap-4 md:gap-6"
          >
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact Us
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-sm text-muted-foreground"
          >
            © {new Date().getFullYear()} SAMS. All rights reserved.
          </motion.div>
        </div>
      </footer>
    </div>
  )
}
