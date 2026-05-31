import mongoose, { mongo } from "mongoose";

interface IGrocery {
  _id?: mongoose.Schema.Types.ObjectId;
  name: string;
  category: string;
  price: number;
  image: string;
  unit: number;
  createdAt: Date;
  updatedAt: Date;
}

const grocerySchema = new mongoose.Schema<IGrocery>({
  name: { type: String, required: true },
  category: { type: String, enum: ["Fruits & Vegetables", "Dairy & Eggs", "Beverages", "Snacks & Cookies", "Bakery", "Pulses & Legumes", "Grains & Cereals", "Seafood", "Spices & Masalas", "Household Essentials", "Instant & Packaged Food", "Baby & Pet care", "Meat & Poultry", "Frozen", "Others"], required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true, default : "" },
  unit: { type: Number, required: true },
}, { timestamps: true })

const GroceryModel = mongoose.models.GroceryModel || mongoose.model("GroceryModel", grocerySchema)

export default GroceryModel