import React from 'react';
import './styles.css';


export default class MainApp extends React.Component {
    constructor(props) {
        super(props);
        this.onSave = this.onSave.bind(this);

        let ip_address =
            localStorage.getItem("ip_address") !== null
                ? localStorage.getItem("ip_address")
                : "";

        this.state = {
            name: "Media Display",
            version: "ver. 0.0.2 dev",
            result: "",
            input: ip_address,
            img_logo: "https://dev.joinposter.com/public/apps/testinguz/icon.webp",
            orderName: "",
        };

        // Показываем кнопки приложения в окне настроек и заказа
        Poster.interface.showApplicationIconAt({
            functions: this.state.name,
            order: this.state.name,
        });

        // Подписываемся на клик по кнопке
        Poster.on('applicationIconClicked', (data) => {
            Poster.interface.popup({width: 500, height: 400, title: 'Second Display'});
        });

        // Подписываемся на ивент открытия заказа
        Poster.on('orderOpen', (order) => {
            console.log(this.state.name, "===> Order opened:", order);

            let payload = {
                isOpen: true,
                orderNumber: String(order.order.id),
                timestamp: new Date().toISOString(),
                totalAmount: Number(0),
                currency: "СУМ",
                items: []
            };

            console.log(this.state.name, '===> orderOpen Payload', JSON.stringify(payload, null, 2))

            this.checkAndShowMissingIP()
            console.log(this.state.name, '===>', this.getUrl() + `/api/order`)
            const params = encodeURIComponent(JSON.stringify(payload));
            Poster.makeRequest(
                this.getUrl() + `/api/order?data=${params}`,
                {
                    method: "POST",
                    // payload: JSON.stringify(payload),
                    localRequest: true,
                },
                async (res) => {
                    console.log(this.state.name, "===> orderOpen Server Response:", res);
                    // Poster.interface.closePopup();
                }
            );
        })

        // Подписываемся на ивент закрытия заказа
        Poster.on('afterOrderClose', (order) => {
            console.log(this.state.name, '===> Order closed: ', order);

            let payload = {
                orderNumber: String(order.order.id),
                totalAmount: 0,
                currency: "СУМ",
                items: []
            };

            console.log(this.state.name, '===> afterOrderClose Payload', JSON.stringify(payload, null, 2))

            this.checkAndShowMissingIP()
            console.log(this.state.name, '===>', this.getUrl() + `/api/close`)
            Poster.makeRequest(
                this.getUrl() + `/api/order/close`,
                {
                    method: "POST",
                    payload: payload,
                    localRequest: true,
                },
                async (res) => {
                    console.log(this.state.name, "===> afterOrderClose Server Response:", res);
                    // Poster.interface.closePopup();
                }
            );
        });

        Poster.on("orderProductChange", async (order) => {
            console.log(this.state.name, "===> Order Changes:", order);

            const productsArray = Array.isArray(order.order.products)
                ? order.order.products
                : Object.values(order.order.products);

            const items = (
                await Promise.all(
                    productsArray.map(async (prod) => {
                        const prodName = await Poster.products.getFullName({id: prod.id});
                        const name = prodName?.name ?? "Unknown Product";

                        const quantity = Number(prod.count) || 0;
                        const price = Number(prod.price) || 0;
                        const itemTotal = Math.round(quantity * price);

                        return {
                            name,
                            quantity,
                            price,
                            itemTotal
                        };
                    })
                )
            ).filter(Boolean);

            const itemsWithTotals = items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                itemTotal: item.price * item.quantity
            }));

            const totalAmount = itemsWithTotals.reduce(
                (sum, item) => sum + item.itemTotal,
                0
            );

            const payload = {
                isOpen: true,
                orderNumber: String(order.order.id),
                timestamp: new Date().toISOString(),
                totalAmount,
                currency: "UZS",
                items: itemsWithTotals
            };

            console.log(this.state.name, '===> HERE ', this.getUrl() + `/api/order`)
            this.checkAndShowMissingIP()
            const params = encodeURIComponent(JSON.stringify(payload));
            Poster.makeRequest(
                this.getUrl() + `/api/order?data=${params}`,
                {
                    method: "POST",
                    // payload: JSON.stringify(payload),
                    localRequest: true,
                },
                async (res) => {
                    console.log(this.state.name, "===> orderProductChange Server Response:", res);
                    // Poster.interface.closePopup();
                }
            );

            console.log(this.state.name, "===> orderProductChange Payload:", JSON.stringify(payload, null, 2));
        });
    }

    showNotification = (title, message) => {
        Poster.interface.showNotification({
            title: title,
            message: message,
            icon: this.state.img_logo,
        });
    };

    getUrl = () => {
        var url = localStorage.getItem("ip_address") || "";
        return url.includes("http") ? url : "http://" + url + ":9000";
    };

    checkAndShowMissingIP = () => {
        var url = localStorage.getItem("ip_address") || "";
        if (url === null || url === "") {
            this.showNotification(this.state.name, 'Отсутствует IP-адрес')
        }
    }

    onSave = () => {
        localStorage.setItem("ip_address", this.state.input);
        console.log('---> URL: ', localStorage.getItem("ip_address"));
        Poster.interface.closePopup();
        this.showNotification(this.state.name, "Настройки сохранены");
    };

    render() {
        const {input, version} = this.state;

        return (
            <div className="main-container">
                <span className="version-badge">{this.state.version}</span>

                <div className="form-group">
                    <label htmlFor="ip_address">IP Address</label>
                    <input
                        type="text"
                        placeholder="Enter IP address"
                        id="ip_address"
                        className="form-control"
                        value={input}
                        onChange={(el) => this.setState({input: el.target.value})}
                    />
                </div>

                <div className="button-group">
                    <button
                        onClick={this.onSave}
                        className="save-btn"
                    >
                        Сохранить
                    </button>
                </div>

                {/*<div className="label">*/}
                {/*    {input}*/}
                {/*</div>*/}
            </div>
        );
    }
}
