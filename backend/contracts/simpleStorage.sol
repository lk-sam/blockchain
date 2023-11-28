// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Marketplace {
    address payable public owner;
    uint256 public itemCount = 0;

    struct Item {
        uint256 id;
        address payable seller;
        address buyer;
        uint256 price;
        string name;
        bool sold;
    }

    mapping(uint256 => Item) public items;

    event ItemListed(uint256 id, address seller, uint256 price, string name);
    event SaleConfirmed(uint256 id, address buyer);
    event ItemUpdated(uint256 id, string name, uint256 price);
    event ItemDeleted(uint256 id);


    constructor() {
        owner = payable(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    function listItem(string memory _name, uint256 _price) public {
        require(_price > 0, "Price must be greater than zero.");

        itemCount++;
        items[itemCount] = Item(
            itemCount,
            payable(msg.sender),
            address(0),
            _price,
            _name,
            false
        );

        emit ItemListed(itemCount, msg.sender, _price, _name);
    }

    function buyItem(uint256 _id) public payable {
        Item storage item = items[_id];
        require(_id > 0 && _id <= itemCount, "Item does not exist.");
        require(msg.value >= item.price, "Not enough Ether provided.");
        require(!item.sold, "Item is already sold.");

        item.buyer = msg.sender;
        item.sold = true;
        item.seller.transfer(item.price);

        emit SaleConfirmed(_id, msg.sender);
    }


    // Function to update an item's price and name by the seller
    function updateItem(uint256 _id, string memory _newName, uint256 _newPrice) public {
        Item storage item = items[_id];
        require(msg.sender == item.seller, "Only the seller can update this item.");
        require(!item.sold, "Item is already sold.");

        item.name = _newName;
        item.price = _newPrice;

        emit ItemUpdated(_id, _newName, _newPrice);
    }

    // Function to delete an item by the seller
    function deleteItem(uint256 _id) public {
        require(msg.sender == items[_id].seller, "Only the seller can delete this item.");
        require(!items[_id].sold, "Sold items cannot be deleted.");

        delete items[_id];
        emit ItemDeleted(_id);
    }

    // Function to read an item's details
    function readItem(uint256 _id) public view returns (Item memory) {
        require(_id > 0 && _id <= itemCount, "Item does not exist.");
        return items[_id];
    }

    // Function to get a list of all items
    function getList() public view returns (Item[] memory) {
        Item[] memory itemList = new Item[](itemCount);
        for (uint256 i = 1; i <= itemCount; i++) {
            Item storage currentItem = items[i];
            itemList[i - 1] = currentItem;
        }
        return itemList;
    }
    
    function getBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }
}
