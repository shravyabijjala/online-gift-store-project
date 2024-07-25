import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  CartItems: CartItem[] = []

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);
  //data will be available even browser window is close.
  storage: Storage = localStorage;

  //Data will be cleared once the browser window is closed
  //storage: Storage = sessionStorage
  
  constructor() { 
    let data = JSON.parse(this.storage.getItem('carItems'));
    if (data != null) {
      this.CartItems = data;
    }
    //compute totals based on the data that is read from storage
    this.computeCartTotals();
  }
  //adding cartItems to the storage
  persistCartItems() {
    this.storage.setItem('carItems', JSON.stringify(this.CartItems));
  }

  addToCart(theCartItem: CartItem) {
    //check if we already have the item in our cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem | undefined;
    if (this.CartItems.length > 0) {
      //finding the item in the cart based on item id
      existingCartItem = this.CartItems.find(
        (tempCartItem) => tempCartItem.id === theCartItem.id
      );
      //check if we found it
      alreadyExistsInCart = existingCartItem != undefined;
    }
    if (alreadyExistsInCart) {
      //increment the quantity
      alert("Product Updated in cart")
      existingCartItem.quantity++;
    } else {
      //just add the item to the cartItems array
      alert("New Product added to cart")
      this.CartItems.push(theCartItem);

    }
    //compute the total price and total quantity for all items in our cart
    this.computeCartTotals();
  }
  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;
    for (let currentCartItem of this.CartItems) {
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue += currentCartItem.quantity;
    }
    //publish the new values...all subscribers will receive the new data on next()
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);
  
    //persist cart data
    this.persistCartItems();
  }
  remove(theCartItem: CartItem) {
    //get index of item from cartItems array
    const itemIndex = this.CartItems.findIndex(
      (tempCartItem) => tempCartItem.id === theCartItem.id
    );
  
    //if found , remove the item
    if (itemIndex > -1) {
      this.CartItems.splice(itemIndex, 1);

      //update cart total and cart price
      this.computeCartTotals();
    }
  }
  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;
    if (theCartItem.quantity === 0) {
      //remove item from cart
      this.remove(theCartItem);
    } else {
      this.computeCartTotals();
    }
  }
  
  incrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity++;
    this.computeCartTotals();
  }
}

