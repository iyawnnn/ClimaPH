export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm mt-12 py-6">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm text-muted-foreground">
        
        {/* Left Side: Copyright */}
        <p className="text-center md:text-left">
          &copy; {year} ClimaPH. All rights reserved.
        </p>

        {/* Right Side: Credit */}
        <p className="flex items-center gap-1">
          Designed & Developed by <span className="font-semibold text-foreground">Ian Macabulos</span>
        </p>
      </div>
    </footer>
  );
}