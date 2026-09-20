export const runtime = "edge";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderTracker from "@/components/OrderTracker";

export const metadata = {
  title: "Track Your Order | Umami Street",
  description: "Check the status of your Umami Street order.",
};

export default function TrackOrderPage() {
  return (
    <>
      <Navbar />
      <main>
        <OrderTracker />
      </main>
      <Footer />
    </>
  );
}
