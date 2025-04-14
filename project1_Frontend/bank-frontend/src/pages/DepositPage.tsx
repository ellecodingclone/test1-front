import React, { useEffect, useState } from "react";
import axios from "../lib/axios";
import { useNavigate } from "react-router-dom";

interface DepositResponse {
  transactionId: string;
  toAccountNumber: string;
  amount: number;
  type: string;
  memo: string;
  status: string;
  balanceAfter: number;
  createdAt: string;
}

interface GetMyAccountResponse {
  accountNumber: string;
  balance: number;
  createdAt: string;
}

export default function DepositPage() {
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [memo, setMemo] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get<GetMyAccountResponse[]>("/accounts/me")
      .then((res) => {
        setAccountNumber(res.data[0].accountNumber);
        setBalance(res.data[0].balance);
      })
      .catch(() => setMessage("❌ 계좌 정보를 가져오지 못했습니다."));
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setMessage("❌ 입금 금액은 0보다 커야 합니다.");
      return;
    }

    try {
      await axios.post<DepositResponse>("/transactions/deposit", {
        toAccountNumber: accountNumber,
        amount: numericAmount,
        memo: memo.trim(),
      });

      navigate("/transactions");
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 403) setMessage("❌ 본인의 계좌만 입금할 수 없습니다.");
      else if (status === 404) setMessage("❌ 계좌를 찾을 수 없습니다.");
      else setMessage("❌ 입금 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={() => navigate("/transactions")}
          className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
        >
          🏠 홈
        </button>
      </div>

      <h2 className="text-3xl font-bold mb-6">💰 입금하기</h2>

      {balance !== null && (
        <p className="mb-4 text-gray-700 text-lg">
          현재 잔액:{" "}
          <span className="font-semibold text-blue-700">
            {balance.toLocaleString()}원
          </span>
        </p>
      )}

      <form onSubmit={handleDeposit} className="flex flex-col gap-4 w-full max-w-md">
        <input
          type="text"
          value={accountNumber}
          readOnly
          placeholder="계좌 번호"
          className="border px-4 py-2 rounded-md bg-gray-100 text-gray-600"
        />
        <input
          type="number"
          min="1"
          placeholder="금액"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border px-4 py-2 rounded-md"
        />
        <input
          type="text"
          placeholder="메모"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="border px-4 py-2 rounded-md"
        />
        <button
          type="submit"
          className="bg-blue-800 text-white py-3 rounded-md text-lg font-semibold"
        >
          입금하기
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-red-600">{message}</p>
        )}
      </form>
    </div>
  );
}
