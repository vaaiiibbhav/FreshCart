import connectDB from "@/app/lib/db"
import HeroSection from "./HeroSection"
import CategorySlider from "./CategorySlider"
import GroceryItemCard from "./GroceryItemCard"
import GroceryModel from "@/models/grocery.model"

export default async function UserDashboard() {
  await connectDB()

  const groceries = await GroceryModel.find({})
  const plainGrocery = JSON.parse(JSON.stringify(groceries))

  return (
    <>
      <HeroSection />
      <CategorySlider />

      <div className="w-[90%] md:w-[80%] mx-auto mt-10">
        <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center">
          Popular Grocery Items
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {plainGrocery.map((item: any, index: number) => (
            <GroceryItemCard key={index} item={item} />
          ))}
        </div>
      </div>
    </>
  )
}
