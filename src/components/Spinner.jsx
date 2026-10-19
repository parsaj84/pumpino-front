import "./../index.css"



export default function Spinner({width  , height , borderTopColor , borderMainColor , borderWidth  }) {
    return (
        <div className="spinner" style={{width , height ,borderColor : borderMainColor , borderWidth ,borderTopColor : borderTopColor}}>

        </div>
    )
}