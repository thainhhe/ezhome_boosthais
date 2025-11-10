import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import PropTypes from "prop-types";

// URL của Google Apps Script để kiểm tra lịch sử giao dịch  https://script.google.com/macros/s/AKfycbwsj23SKjwouyK8e0iw3d0kVP0TnQcb0QoxJfv7d_oCdgM5o42JMWWNtbgX0LCSyW2O/exec
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwsj23SKjwouyK8e0iw3d0kVP0TnQcb0QoxJfv7d_oCdgM5o42JMWWNtbgX0LCSyW2O/exec";

const CheckPayment = ({ totalMoney, txt, onPaymentSuccess }) => {
  const [paidLoad, setPaidLoad] = useState(0);

  useEffect(() => {
    if (!txt || !totalMoney) return;

    const interval = setInterval(() => {
      async function checkPay() {
        try {
          const response = await fetch(GOOGLE_SCRIPT_URL);
          if (!response.ok) {
            console.error(
              "Lỗi khi gọi Google Script, status:",
              response.status
            );
            return;
          }
          const data = await response.json();

          if (!data || !Array.isArray(data.data)) {
            console.error(
              "Dữ liệu trả về từ Google Script không hợp lệ:",
              data
            );
            return;
          }

          for (const item of data.data) {
            const description = item["Mô tả"] || "";
            const amount = Number(item["Giá trị"]) || 0;

            const matchedDescription = description
              .toLowerCase()
              .includes(txt.toLowerCase().trim());

            const matchedValue = amount === Number(totalMoney);

            if (matchedDescription && matchedValue) {
              setPaidLoad(1);
              toast.success("Thanh toán thành công!");
              onPaymentSuccess();
              clearInterval(interval);
              break;
            }
          }
        } catch (err) {
          console.error("Lỗi khi kiểm tra thanh toán:", err);
        }
      }

      checkPay();
    }, 5000);

    return () => clearInterval(interval);
  }, [totalMoney, txt, onPaymentSuccess]);

  return <input type="hidden" id="paidLoad" value={paidLoad} />;
};

CheckPayment.propTypes = {
  totalMoney: PropTypes.number.isRequired,
  txt: PropTypes.string.isRequired,
  onPaymentSuccess: PropTypes.func.isRequired,
};

export default CheckPayment;
