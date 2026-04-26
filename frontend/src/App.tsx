import './App.css'

function App() {

  fetch("http://localhost:5000/api/test")
  .then(res => res.json())
  .then(data => console.log(data));

  return (
    <>
      
    </>
  )
}

export default App
