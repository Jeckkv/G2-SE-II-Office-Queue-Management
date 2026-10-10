const SERVICE_TYPES = Object.freeze({
  1: "DEPOSIT",
  2: "SHIPPING",
  3: "ACCOUNTS",
  4: "PAYMENTS",
});

const NOF_SERVICES = Object.keys(SERVICE_TYPES).length;

export { SERVICE_TYPES, NOF_SERVICES };
