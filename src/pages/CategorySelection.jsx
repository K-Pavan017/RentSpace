import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar'


const categories = [
  {
    name: 'Tent House Items',
    image: 'https://content.jdmagicbox.com/v2/comp/hyderabad/q5/040pxx40.xx40.110727085053.b7q5/catalogue/shaik-tabrez-tent-house-and-catering-services-malakpet-hyderabad-tent-house-tc5fap2btc.jpg'
  },
  { 
    name: 'Houses',
    image: 'https://plus.unsplash.com/premium_photo-1689609950112-d66095626efb?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aG91c2V8ZW58MHx8MHx8fDA%3D'
  },
  {
    name: 'Cameras',
    image: 'https://i.pinimg.com/736x/e7/5d/db/e75ddbda351d44e24b6b8099fa200aad.jpg'
  },
  {
    name: 'Furniture',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUtnXBQbe53JNRC6DiLA9HmwJEaSpe_yjwNQ&s'
  },
  { 
    name: 'Bikes',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScZBcKySYGFD0AbO4hMZJ81AJb0aLg1wiCJA&s'
  },
  { 
    name: 'Cars',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ93DyEI75_ogOAE7hli4rX9zc8QUfksfrSIw&s'
  },
  {
    name: 'Party Equipment',
    image: 'https://partyplaza1.com/wp-content/uploads/2017/04/party-plaza-party-rental-shop-in-Glendale-ca.jpg'
  },
  {
    name: 'Electronics',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTV3Dypewej8FDxKVeOBblJ_XrtlZfEODPTDA&s'
  },
  {
    name: 'Musical Instruments',
    image: 'https://stylesatlife.com/wp-content/uploads/2022/05/drums.jpg.webp'
  },
  {
    name: 'Makeup Artist',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRa_41SkZ5BMGrv0_BmijQy482B6T0EOp6dLg&s'
  },
  {
    name: 'Pets',
    image: 'https://www.zauca.com/wp-content/uploads/pets_website_design_ecommerce_company.jpg'
  },
  {
    name: 'Video Games',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZUoJsw1FwR0SnpzUMj95fS6DViVL7grUXhg&s'
  },
];

const CategorySelection = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    navigate(`/add-item/${categoryName.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <Navbar />
      {/* Header Banner */}
      <div className="bg-slate-900 text-white pt-20 pb-24 px-6 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3 h-3" />
            Step 1: Choose Type
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            What are you <span className="text-blue-400">listing?</span>
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            Select the most relevant category for your item to reach the right audience.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-6 -mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.name}
              onClick={() => handleCategoryClick(category.name)}
              className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer bg-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              {/* Image */}
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Text Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      {category.name}
                    </h2>
                    <p className="text-blue-300 text-xs font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      Select Category
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-6 mt-16 text-center">
        <p className="text-slate-400 text-sm">
          Don't see your category? <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Contact Support</span>
        </p>
      </div>
    </div>
  );
};

export default CategorySelection;