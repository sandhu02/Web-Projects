import { useState } from "react"

function Counter() {
    let [count , setCount] = useState(0)

    let inCount = () => {setCount(count+1)}

    return(
        <div>
            <button onClick={inCount}>Count</button>
            <span> {count} </span>
        </div>
    )
}

export default Counter