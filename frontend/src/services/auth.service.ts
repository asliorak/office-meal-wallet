import axios from "axios";

const API_URL = "http://localhost:3000/auth";

// TypeScript için veri tiplerini (Interface) tanımlıyoruz
interface RegisterData {
  email: string;
  password: string;
  name: string;
  surname: string;
  role?: string;
}

interface LoginData {
  email: string;
  password: string;
}

// Kullanıcı Kayıt (Register) İsteği
export const registerUser = async (userData: RegisterData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || "Kayıt işlemi başarısız oldu.";
    }
    throw "Bilinmeyen bir hata oluştu.";
  }
};

// Kullanıcı Giriş (Login) İstek Fonksiyonu
export const loginUser = async (loginData: LoginData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, loginData);
    // Backend'den gelen veriyi (içinde user object ve role var) doğrudan dönüyoruz
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || "Giriş işlemi başarısız oldu.";
    }
    throw "Bilinmeyen bir hata oluştu.";
  }
};

// Çıkış Yapma Fonksiyonu
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
