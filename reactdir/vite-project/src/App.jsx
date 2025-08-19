import './App.css'
import Product from './Product'
import Title from './Title'
import MsgBox from './MsgBox'
import Counter from './Counter'
import LikeButton from './LikeButton'
import Ludo from './Ludo'

function App() {
  let features = ["durable" , "good"]
  return  (
    <>
      <MsgBox userName = "Awais" textColor = "yellow" />
      <Title/>
      <Product name="Book" description="NAT-IM" features={features}/>
      <Product name="Pen" description="Dollar fountain sp-10"/>
      <Counter/>
      <LikeButton/>
      <Ludo />
    </>
  )
    
}

export default App
