import "./Product.css";

function Product({name = "Product",description = "Description" , features = [] }) {
    const styles = {backgroundColor : name == "Pen" ? "yellow" : "pink"}

    const list = features.map(feat => <li>{feat}</li>) 
    return (
        <div className="Product" style={styles}>
            <h1>{name}</h1>
            <h3>{description}</h3>
            <h3>{list}</h3>
        </div>
    )
}

export default Product