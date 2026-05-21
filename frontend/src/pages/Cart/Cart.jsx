import React from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import CartItems from '../../components/CartItems/CartItems'
const Cart=() =>{
    return(
        <div>
            <Navbar />
            <CartItems/>
            <Footer />
        </div>
    )
}
export default Cart
