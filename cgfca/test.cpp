// #include <cpr/cpr.h>
#include <iostream>
#include <string>
#include "json.hpp"

using json = nlohmann::json;

// Function to replace cout
// void customCout(const std::string& message) {
//     cpr::Post(cpr::Url{"http://localhost:3000/output"},
//               cpr::Body{"{\"message\":\"" + message + "\"}"},
//               cpr::Header{{"Content-Type", "application/json"}});
// }

// // Function to replace cin
// std::string customCin() {
//     auto response = cpr::Get(cpr::Url{"http://localhost:3000/input"});
//     if (response.status_code == 200) {
//         // Parse the response body to extract the input
//         auto input = json::parse(response.text)["input"];
//         return input;
//     }
//     return ""; // Return an empty string or handle as needed if no input is available
// }

// int main() {
//     // Example usage
//     customCout("Hello, Node.js server!");

//     std::string userInput = customCin();
//     customCout("Received input: " + userInput);

//     return 0;
// }

int main() {
    auto input = json::parse("test")["input"];
    std::cout << input;
}