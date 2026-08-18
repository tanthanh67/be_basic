const user = {
  name: "John Doe",
  email: "john.doe@example.com",
  address: {
    street: "123 Main St",
    city: "Anytown",
    state: "CA",
    zip: "12345",
  },
};

const addressOfUser = ({
  address: { street, ...hehe },
} = user);

console.log(addressOfUser);
