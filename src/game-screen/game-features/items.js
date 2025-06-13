import burgerImg from "../../assets/image/burger.png";
import sushiImg from "../../assets/image/sushi.png";
import bottleImg from "../../assets/image/botol.png";

export const items = {
	// Food items
	sandwich: {
		id: "sandwich",
		name: "Sandwich",
		type: "food",
		effect: 20,
		icon: "/assets/items/sandwich.png",
		description: "A tasty sandwich that restores fullness",
	},
	energyDrink: {
		id: "energyDrink",
		name: "Energy Drink",
		type: "energy",
		effect: 25,
		icon: "/assets/items/energy-drink.png",
		description: "A refreshing drink that boosts energy",
	},
	soap: {
		id: "soap",
		name: "Soap",
		type: "hygiene",
		effect: 30,
		icon: "/assets/items/soap.png",
		description: "Keeps you clean and fresh",
	},
	toy: {
		id: "toy",
		name: "Toy",
		type: "happiness",
		effect: 15,
		icon: "/assets/items/toy.png",
		description: "A fun toy that increases happiness",
	},
	// New items
	burger: {
		id: "burger",
		name: "Burger",
		type: "food",
		effect: 30,
		icon: burgerImg,
		description: "A delicious burger that restores fullness",
	},
	sushi: {
		id: "sushi",
		name: "Sushi",
		type: "food",
		effect: 25,
		icon: sushiImg,
		description: "Fresh sushi that restores energy",
	},
	airPutih: {
		id: "airPutih",
		name: "Air Putih",
		type: "energy",
		effect: 15,
		icon: bottleImg,
		description: "Refreshing water that restores energy",
	},
	// Add more items as needed
};

// Helper function to get a random item
export const getRandomItem = () => {
	const itemKeys = Object.keys(items);
	const randomKey = itemKeys[Math.floor(Math.random() * itemKeys.length)];
	return items[randomKey];
};
