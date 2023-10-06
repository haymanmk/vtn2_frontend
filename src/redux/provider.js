import store from "src/redux/store";
import { Provider } from "react-redux";

const ReduxProvider = ({ children }) => <Provider store={store}>{children}</Provider>;

export default ReduxProvider;
