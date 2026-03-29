import React from 'react'
import Button from '../components/ui/Button'
import SearchBar from '../components/products/SearchBar'
import Card from '../components/ui/Card'
import CategoryList from '../components/products/CategoryList'
import MinMaxPrice from '../components/products/MinMaxPrice'

const Products = () => {
  return (
    <div>
      <h1>product page</h1>
      <SearchBar/>
      <Button/>
      <Card/>
      <CategoryList/>
      <MinMaxPrice/>
    </div>
  )
}

export default Products
