import React, { useState, useEffect } from "react";

const CurrencySwitcher = ({ onCurrencyChange }) => {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [convertedBalance, setConvertedBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConvertedBalance = async () => {
      setLoading(true);
      setError("");
      try {
        const defaultBalance = 200000;

        // Simulate API call to convert balance
        const response = await fetch(
          `https://api.exchangerate-api.com/v4/latest/USD`,
        );
        const data = await response.json();
        const rate = data.rates[selectedCurrency];
        const converted = defaultBalance * rate;
        setConvertedBalance(converted);
      } catch (err) {
        console.error(err);
        setError("Could not convert balance");
      } finally {
        setLoading(false);
      }
    };
    fetchConvertedBalance();
  }, [selectedCurrency, onCurrencyChange]);

  return (
    <div
      style={{
        marginBottom: 20,
        padding: 10,
        background: "#f5f5f5",
        borderRadius: 8,
      }}
    >
      <label htmlFor="currency-select" style={{ marginRight: 10 }}>
        Show balance in:{" "}
      </label>
      <select
        id="currency-select"
        value={selectedCurrency}
        onChange={(e) => setSelectedCurrency(e.target.value)}
      >
        <option value="USD">USD - US Dollar</option>
        <option value="EUR">EUR - Euro</option>
        <option value="GBP">GBP - British Pound</option>
        <option value="ZAR">ZAR - South African Rand</option>
      </select>
      <div style={{ marginTop: 10, fontWeight: "bold" }}>
        {loading ? (
          "Loading..."
        ) : error ? (
          <span style={{ color: "red" }}>{error}</span>
        ) : convertedBalance !== null ? (
          `${selectedCurrency} ${convertedBalance.toFixed(2)}`
        ) : (
          "Unable to load balance"
        )}
      </div>
    </div>
  );
};

export default CurrencySwitcher;
