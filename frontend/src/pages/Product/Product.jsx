import React, { useContext } from 'react'
import { ShopContext } from '../../context/ShopContext'
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import Breadcrum from '../../components/Breadcrums/Breadcrum';
import ProductDisplay from '../../components/ProductDisplay/ProductDisplay';
import RelatedProducts from '../../components/RelatedProducts/RelatedProducts';
const Product=() =>{
    const {all_product}=useContext(ShopContext);
    const {productId}=useParams();
    const product =all_product.find((e)=> e.id === Number(productId));

    return(
        <div>
            <Navbar />
            <Breadcrum product ={product}/>
            <ProductDisplay product ={product}/>
            <RelatedProducts category={product?.category} id={product?.id}/>
            <Footer />
        </div>
    )
}
export default Product
