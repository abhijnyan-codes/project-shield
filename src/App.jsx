import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Analyze from './pages/Analyze'
import LiveShield from './pages/LiveShield'
import NetworkMap from './pages/NetworkMap'
import CyberSafe from './pages/CyberSafe' // ✅ NEW

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/live-shield" element={<LiveShield />} />
            <Route path="/network" element={<NetworkMap />} />
            <Route path="/cybersafe" element={<CyberSafe />} /> {/* ✅ NEW */}
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App