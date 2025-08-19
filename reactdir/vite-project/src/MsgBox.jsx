function MsgBox({userName ="name" , textColor = "pink"}) {
    let styles = {color : textColor}
    return (
        <h1 style={styles}>hello {userName}</h1>
    )
}

export default MsgBox