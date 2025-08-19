export default function Ludo() {
    const bluebox = new Box("blue" ) 
    const greenbox = new Box("green") 
    const redbox = new Box("red") 
    const yellowbox = new Box("yellow") 

    return (
        <div>
            <button style={{backgroundColor : red}}>red</button>
            <button>green</button>
            <button>blue</button>
            <button>yellow</button>
        </div>
    )
}

class Box{
    constructor(color) {
        this.color = color;
        this.count = 0;
    }
}