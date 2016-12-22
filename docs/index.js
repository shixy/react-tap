import React from 'react'
import ReactDom, {render} from 'react-dom'

require('../index.js');

require('./demo.less');

class Main extends React.Component {
    onTap(index) {
        alert(index);
    }
    render () {
        return (
            <div>
                <div className="demo-title">Tap</div>
                <div className="tap-container">
                    <div className="tap button" onTap={()=>this.onTap(1)} tapActive={true}>tap1</div>
                    <div className="tap button" onTap={()=>this.onTap(2)} tapActive={'tap-ripple'}>tap2</div>
                    <div className="tap button" onTap={()=>this.onTap(3)} tapActive={'green'}>tap3</div>
                </div>
            </div>
        )
    }
}

render(<Main />, document.getElementById('container'));
