const express = require('express');
const cors = require('cors');
const qrCode = require('qrcode');


const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate-qr',  async(req ,res) =>{
    const {text , options } = req.body;
    
    if(!text){
        return res.status(400).json({
            error : "text is required to generate qr "
        })
    }

    try {
        const url = await qrCode.toDataURL(text , option);
        res.json({
            qrCodeUrl : url
        })

    } catch (error) {
        console.log("Error generating Qr code", error);
        res.status(500).json({
            error: "Failed to generate Qr code"
        })
    }
}
    
);

app.listen(5000, () => console.log('Server running on port 5000'));