import React from 'react'
import Header from '../components/Header'
import { 
  useAddress,
  useContract,
  MediaRenderer,
  useNetwork,
  useNetworkMismatch,
  useOwnedNFTs,
  useCreateAuctionListing,
  useCreateDirectListing
  } from "@thirdweb-dev/react"
import Router, { useRouter } from 'next/router'
import { NFT, ChainId, NATIVE_TOKENS, NATIVE_TOKEN_ADDRESS } from '@thirdweb-dev/sdk'
import network from '../utils/network'

type Props = {}

const Create = (props: Props) => {
  const [selected,setSelected] = React.useState<NFT>()
  const router = useRouter()

  // grab if user is logged
  const address = useAddress()
  
  // get mktplace contract contract
  const { contract: marketplaceContract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    'marketplace'
  )

   // get collection contract contract
   const { contract: collectionContract } = useContract(
    process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
    'nft-collection'
  )

  const ownedNfts = useOwnedNFTs(collectionContract, address)

  const networkMismatch = useNetworkMismatch()
  const [, switchNetwork] = useNetwork()
  
  // hook that creates the listing
  const {
    mutate: createDirectListing, 
    isLoading, 
    error
  } = useCreateDirectListing(marketplaceContract)

  const {
    mutate: createAuctionListing, 
    isLoading: isLoadingAuction, 
    error: errorAuction
  } = useCreateAuctionListing(marketplaceContract)

  // this function get called when the form is submitted
  // the user provided:
  // contract address, token id, type of listing (auction or direct), price of NFT
  const handleCreateListing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (networkMismatch) {
      switchNetwork && switchNetwork(network)
      console.log("problem... switching network")
      return;
    }

    if (!selected) {
      console.log("no selected NFT my friend...")
      return
    }

    // creating the type
    const target = e.target as typeof e.target & {
      elements: {
        listingType: { value: string },
        price: { value: string }
      }
    }

    const {listingType, price} = target.elements;

    if (listingType.value === "directListing"){
      createDirectListing({
        assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
        tokenId: selected.metadata.id,
        currencyContractAddress: NATIVE_TOKEN_ADDRESS,
        listingDurationInSeconds: 60 * 60 * 24 * 7, // 1 week
        quantity: 1,
        buyoutPricePerToken: price.value,
        startTimestamp: new Date()
      }, {
        onSuccess(data,variables,context){
          console.log("SUCCESS!  ", data, variables, context)
          router.push("/")
        },
        onError(data,variables,context){
          console.log("ERROR!  ", error, variables, context)
        }
      })
    }

    if (listingType.value === "auctionListing") {
      createAuctionListing({
        assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
        tokenId: selected.metadata.id,
        currencyContractAddress: NATIVE_TOKEN_ADDRESS,
        listingDurationInSeconds: 60 * 60 * 24 * 7, // 1 week
        quantity: 1,
        buyoutPricePerToken: price.value,
        startTimestamp: new Date(),
        reservePricePerToken: 0
      }, 
      {
        onSuccess(data,variables,context){
          console.log("SUCCESS!  ", data, variables, context)
          router.push("/")
        },
        onError(data,variables,context){
          console.log("ERROR!  ", error, variables, context)
        }
      }
      )
    }

  }
  
  return (
    <div>
      <Header />
      
      <main className="max-w-6xl mx-auto p-10 pt-2">
        <h1 className="text-4xl font-bold">List an Item</h1>
        <h2 className="text-xl font-semibold pt-5">Select an Item you would like to sell</h2>
        <hr className="mb-5"/>
        {address && <p>NFT's owned by you:</p>}

        {address ? (<div  className="flex overflow-x-scroll space-x-2 p-4">
          {ownedNfts?.data?.map((nft) => (
            <div
            onClick={() => setSelected(nft)}
            key={nft.metadata.id} className={`flex flex-col space-y-2 card min-w-fit border-2 
            ${nft.metadata.id === selected?.metadata.id ? "border-black bg-gray-300 hover:bg-gray-300" : "border-transparent"}`}>
              <MediaRenderer src={nft.metadata.image} className="h-48 rounded-lg"/>
              <p className="text-lg truncate font-bold">{nft.metadata.name}</p>
              <p className="text-xs truncate">{nft.metadata.description}</p>
            </div>
          ))}
        </div>) : (
          <p className="text-xl text-red-600 font-bold mt-5">Login to see your NFT's</p>
        )}

        {selected && (
          <form action="" onSubmit={handleCreateListing}>
            <div className="flex flex-col p-10">
              <div className="grid grid-cols-2 gap-5">
                <label className="border-r font-light" htmlFor="">Direct Listing / Fixed Price</label>
                <input type="radio" name="listingType" value="directListing"  className="ml-auto h-8 w-8"/>

                <label className="border-r font-light" htmlFor="">Auction</label>
                <input type="radio" name="listingType" value="auctionListing" className="ml-auto h-8 w-8"/>

                <label htmlFor="" className="border-r font-light">Price</label>
                <input type="text" placeholder='0.05' className="bg-gray-100 p-2" name="price" />
              </div>

              <button className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 mt-8 rounded-lg w-[200px] mx-auto" type="submit">
                Create Listing
              </button>
            </div>
          </form>
        )}
      </main>

    </div>
  )
}

export default Create