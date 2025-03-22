export const formatNumber = (number) => {
    return new Intl.NumberFormat().format(number);
};

export const calculateTotal = (items) => {
    return items.reduce((total, item) => total + item.value, 0);
};

// Add more utility functions as needed
