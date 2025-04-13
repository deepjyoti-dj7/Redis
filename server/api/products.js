export const getAllProducts = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        products: [
          {
            id: 1,
            name: "Product 1",
            price: 100,
          },
        ],
      });
    }, 2000);
  });

export const getOneProductDetails = (id) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        product: [
          {
            id: id,
            name: `Product ${id}`,
            price: Math.floor(Math.random() * id * 100),
          },
        ],
      });
    }, 2000);
  });
