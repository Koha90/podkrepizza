import './App.css'

import Header from './components/Header'
import AppRouters from './AppRouters'


function App() {

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-6">
        <AppRouters />
      </main>
    </>
  )
}

export default App
