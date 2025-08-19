import { useState } from "react"

export default function LikeButton() {
    let [like  ,setLike] = useState(false)
    let toggleLike = () => {setLike(!like)}

    return (
        <div>
            <span>like it </span>
            <span onClick={toggleLike}>
                {like ? <i on class="fa-solid fa-heart"></i> : 
                    <i className="fa-regular fa-heart"></i>
                }
            </span>    
        </div>
    )
}