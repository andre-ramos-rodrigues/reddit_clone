import React from 'react'
import Header from '../components/Header'
import { useAddress, useContract } from "@thirdweb-dev/react"
import { useRouter } from 'next/router'

type Props = {}

const AddItem = (props: Props) => {
  const [preview,setPreview] = React.useState<String>()
  const [image,setImage] = React.useState<File>()
  const router = useRouter()

  // get if user is logged in
  const address = useAddress()

  // get user contract 
  const { contract } = useContract(process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
    "nft-collection")

  const mintNft = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("submitting....")

    if(!contract || !address) {
      console.log(contract)
      console.log(address)
      return;
    }

    if(!image) {
      alert('plesase select an image')
      return
    };

    // type assertion
    const target = e.target as typeof e.target & {
      name: { value: string }
      description: { value: string}
    }

    // the data that will be sent to thirdweb
    const metadata = {
      name: target.name.value,
      description: target.description.value,
      image: image
    }

    try {

      const tx = await contract?.mintTo(address!, metadata);
      const receipt = tx.receipt // transaction receipt
      const tokenId = tx.id // id of the NFT minted
      const nft = await tx.data() // fetch details of minted NFT

      console.log(receipt, tokenId, nft)
      router.push('/')
    }catch(err){
      console.log(err)
    }
  }

    
  return (
    <div>
      <Header />
      <main className="max-w-6xl mx-auto p-10 border flex flex-col justify-center">
        <h1 className="text-2xl md:text-4xl font-bold">Add an Item to the Marketplace</h1>
        <h2 className="text-xl font-semibold pt-5">Item details</h2>
        <p className="pb-5">By adding an item to the marketplace, you're Minting an NFT to the item into your wallet.</p>

        <div className="flex">
          <img src={preview? preview as string : "https://links.papareact.com/ucj"} alt="" className="border h-80 w-80 object-contain hidden md:inline"/>
          <form onSubmit={mintNft} className="flex flex-col flex-1 md:py-3 md:px-5 gap-5">
            <label htmlFor="" className="font-bold text-lg text-gray-800">Name of Item</label>
            <input placeholder="Ex: Real Madrid 22/23 shirt" type="text" className="formField" name="name"/>
            <label htmlFor="" className="font-bold text-lg text-gray-800">Description</label>
            <input placeholder="Ex: White Home Shirt" type="text" className="formField" name="description"/>
            <div className="flex justify-between">
            <label htmlFor="img" className="bg-blue-400 hover:bg-blue-500 addBtn" >Select Image</label>
            <input type="file" className="hidden" name="img" id="img" onChange={(e) => {
              if (e.target.files?.[0]) {
                setPreview(URL.createObjectURL(e.target.files[0]))
                setImage(e.target.files[0])
              }
            }}
            />
            <button className="addBtn bg-green-400 hover:bg-green-500" type="submit">Add Mint</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default AddItem
