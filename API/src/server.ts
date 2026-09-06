import { ENV } from './config/env';
import app from './app';


const PORT = ENV.PORT;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});