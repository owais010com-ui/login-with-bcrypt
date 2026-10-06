import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { GlobalContext } from '../context/Context';
import api from '../components/api';

const Home = () => {
    const { state, dispatch } = useContext(GlobalContext);
    const user = state.user;
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    const logout = async () => {
        try {
            await api.post('/logout', {});
            dispatch({ type: 'USER_LOGOUT' });
        } catch (error) {
            console.log(error.response?.data?.message ?? error.message);
        }
    };

    const getProducts = async () => {
        try {
            const apiRes = await api.get('/products');
            setProducts(apiRes.data.products);
        } catch (error) {
            console.log("error", error);
        }
    };

    useEffect(() => {
        getProducts();
    }, []);

    return (
        <main className="home-page">

            <header className="home-header">

                <div className="home-header__user">
                    <div className="avatar">{user?.full_name?.charAt(0).toUpperCase()}</div>
                    <div>
                        <h2>{user?.full_name}</h2>
                        <span className="badge">{user?.role}</span>
                    </div>
                </div>

                <div className="home-header__actions">
                    {user?.role === "admin" && (
                        <>
                            <button className="btn" onClick={() => navigate('/userList')}>
                                Users
                            </button>
                            <button className="btn" onClick={() => navigate('/categories')}>
                                Categories
                            </button>
                            <button className="btn add-product-btn" onClick={() => navigate('/products')}>
                                Add Product
                            </button>
                        </>
                    )}
                    <button className="btn logout-btn" onClick={logout}>Log out</button>
                </div>

            </header>

            <section className="products-section">
                <h3>Products</h3>
                <div className="products-grid">
                    {products.map((p) => (
                        <div key={p.id} className="product-card">
                            {p.images && p.images.length > 0 && (
                                <img
                                    src={p.images[0]}
                                    alt={p.name}
                                    style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "8px" }}
                                />
                            )}
                            <p className="product-name">{p.name}</p>
                            <p className="product-price">Rs. {p.price}</p>
                            <p className="product-stock">Stock: {p.stock}</p>
                            <p className="product-category">{p.category_name}</p>
                        </div>
                    ))}
                </div>
            </section>

        </main>
    );
};

export default Home;