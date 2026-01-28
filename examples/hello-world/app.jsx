import React from 'react';
import './styles.css';


export default class MainApp extends React.Component {
    constructor(props) {
        super(props);
        this.onSave = this.onSave.bind(this);

        let ip_address =
            localStorage.getItem("ip_address ") !== null
                ? localStorage.getItem("ip_address")
                : "";


        this.state = {
            name: "Second Display",
            version: "ver. 0.0.5 dev",
            result: "",
            input: ip_address,
            img_logo: "https://dev.joinposter.com/public/apps/testinguz/icon.webp",
        };

        // Показываем кнопки приложения в окне настроек и заказа
        Poster.interface.showApplicationIconAt({
            functions: 'Second Display 1',
            order: 'Second Display 2',
        });

        // Подписываемся на клик по кнопке
        Poster.on('applicationIconClicked', (data) => {
            if (data.place === 'order') {
                this.setState({emoji: '👩‍🍳', message: 'Вы открыли окно заказа!'});
            } else {
                this.setState({emoji: '💵', message: 'Abduraxmon, Checkout modal!'});
            }
            // Показываем интерфейс
            Poster.interface.popup({width: 500, height: 400, title: 'Second Display'});
        });

        // Подписываемся на ивент открытия заказа
        Poster.on('orderOpen', (order) => {
            let orderData = order.order;
            console.log('Order opened: ', order);
            console.log('Order opened id: ', order.order.id);

            let payload = {
                isOpenOrder: true,
                orderId: orderData.id,
            }
            console.log('Order opened payload: ', payload)

            Poster.makeRequest(
                this.getUrl() + `/api/v1/order/open/`,
                {
                    headers: ["Content-Type: application/json"],
                    method: "post",
                    payload: JSON.stringify(payload),
                    localRequest: true,
                },
                async (res) => {
                    // if (!res?.result?.is_success) {
                    //
                    //     return;
                    // }
                    console.log(res);

                    // Poster.interface.closePopup();
                    // this.setState({isProcessing: false});
                }
            );
        })

        // Подписываемся на ивент закрытия заказа
        Poster.on('afterOrderClose', (order) => {
            let orderData = order.order;
            console.log(this.state.name, '===> Order closed: ', order);
            console.log(this.state.name, '===> Order closed id: ', order.order.id);
            console.log(this.state.name, '===> Order closed data: ', orderData);

            let payload = {
                isCloseOrder: true,
                orderId: orderData.id,
            }
            console.log(this.state.name, '===> Order closed payload: ', payload)

            // Poster.makeRequest(
            //     this.getUrl() + `/order/close/`,
            //     {
            //         headers: ["Content-Type: application/json"],
            //         method: "post",
            //         payload: JSON.stringify(payload),
            //         localRequest: true,
            //     },
            //     async (res) => {
            //         // if (!res?.result?.is_success) {
            //         //     this.setState({isProcessing: false});
            //         //     return;
            //         // }
            //         //
            //         // await this.order_create_function(cardType, orderSnapshot);
            //         //
            //         // Poster.interface.closePopup();
            //         // this.setState({isProcessing: false});
            //     }
            // );
        });

        Poster.on('orderProductChange', (order) => {
            const productsArray = Array.isArray(order.order.products)
                ? order.order.products
                : Object.values(order.order.products);

            productsArray.map(async (pr) => {
                    Poster.products.get([pr.id])
                        .then((products) => {
                            let prod = products[0]
                            // console.log(this.state.name, '===> Product: ', products[0]);
                            let productName = null

                            Poster.products.getFullName({
                                id: pr.id,
                            }).then((prodName) => {
                                productName = prodName.name;
                            });

                            let payload = {
                                name: productName,
                                price: prod.price,
                                picture: prod.picture,
                                taxName: prod.taxName,
                                taxValue: prod.taxValue,
                            }
                            console.log(this.state.name, '===> Order opened payload: ', payload)

                            Poster.makeRequest(
                                this.getUrl() + `/order/products/`,
                                {
                                    headers: ["Content-Type: application/json"],
                                    method: "post",
                                    payload: JSON.stringify(payload),
                                    localRequest: true,
                                },
                                async (res) => {
                                    // if (!res?.result?.is_success) {
                                    //     this.setState({isProcessing: false});
                                    //     return;
                                    // }
                                    //
                                    // await this.order_create_function(cardType, orderSnapshot);
                                    //
                                    // Poster.interface.closePopup();
                                    // this.setState({isProcessing: false});
                                }
                            );
                        })
                }
            )
        })
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
        console.log(this.state.name + ':: URL ', url);
        return url.includes("http") ? url : "http://" + url + ":9090";
    };

    onSave = () => {
        localStorage.setItem("ip_address", this.state.input);
        console.log(localStorage.getItem("ip_address"));
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
