import { Routes, Route } from 'react-router-dom'
import CreationWizard from './components/CreationWizard'

function App() {
  return (
    <Routes>
      <Route path="/*" element={<CreationWizard />} />
    </Routes>
  )
}

export default App
