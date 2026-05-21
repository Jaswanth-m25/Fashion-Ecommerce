import React from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import Hero from '../../components/Hero/Hero'
import Popular from '../../components/popular/popular'
import Offers from '../../components/offers/offers'
import NewCollections from '../../components/NewCollections/NewCollections'
import LatestCollection from '../../components/LatestCollection/LatestCollection'
import NewsLetter from '../../components/NewsLetter/NewsLetter'

const Shop=() =>{
    return(
        <div>
            <Navbar />
            <Hero/>
            {/* <NewCollections/> */}
            <Popular/>
            <LatestCollection/>
            {/* <Offers/> */}
            {/* <NewsLetter/> */}
            <Footer />
        </div>
    )
}
export default Shop
