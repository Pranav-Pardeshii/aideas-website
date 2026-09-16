import './index.css'
import { HomePage } from './pages/HomePage'
import { NeuralBackground } from './components/ui/NeuralBackground'

export default function App() {
  return (
    <>
      <NeuralBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <HomePage />
      </div>
    </>
  )
}
