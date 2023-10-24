import { Resolver, Query } from '@nestjs/graphql';
import * as os from 'os'; // Import 'os' module

@Resolver()
export class IPResolver {
    @Query(() => String) // Define the GraphQL query
    getIPAddress(): string {
        const networkInterfaces = os.networkInterfaces();
        let ipAddress = 'localhost';

        if (networkInterfaces['Wi-Fi']) {
            ipAddress = networkInterfaces['Wi-Fi'][0].address;
        } else if (networkInterfaces['eth0']) {
            ipAddress = networkInterfaces['eth0'][0].address;
        }

        return ipAddress;
    }
}
