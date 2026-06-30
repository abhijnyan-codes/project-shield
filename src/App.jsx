import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ScamDetector from './pages/ScamDetector'
import LiveShield from './pages/LiveShield'
import NetworkMap from './pages/NetworkMap'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<ScamDetector />} />
            <Route path="/live-shield" element={<LiveShield />} />
            <Route path="/network" element={<NetworkMap />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App