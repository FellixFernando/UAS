import React from "react";
import "./inventory.css";

const Inventory = ({ items, onUseItem }) => {
	return (
		<div className="inventory-container">
			<h3>Inventory</h3>
			<div className="inventory-grid">
				{items.map((item, index) => (
					<div
						key={index}
						className="inventory-slot"
						onClick={() => onUseItem(item)}>
						{item ? (
							<div className="inventory-item">
								<img src={item.icon} alt={item.name} />
								<span className="item-name">{item.name}</span>
								{item.quantity > 1 && (
									<span className="item-quantity">{item.quantity}</span>
								)}
							</div>
						) : (
							<div className="empty-slot"></div>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default Inventory;
