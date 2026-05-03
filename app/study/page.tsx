// @ts-nocheck
"use client"
import Link from "next/link"
import OmniNav from "@/components/omni-nav"
import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence, useInView } from "motion/react"

/* ─────────────────────────────────────────────────────────────
   DATA — 50 study materials across all 15 languages
───────────────────────────────────────────────────────────── */
type Difficulty = "beginner" | "intermediate" | "advanced"
type Category   = "syntax" | "bridge" | "stdlib" | "patterns" | "deploy" | "ml" | "web" | "systems" | "concurrency" | "testing"

interface Study {
  id:         number
  title:      string
  lang:       string
  langColor:  string
  difficulty: Difficulty
  category:   Category
  desc:       string
  tags:       string[]
  code:       string
  docLink:    string
}

const STUDIES: Study[] = [
  {
    id: 1, title: "Variables & Ownership in OMNI",
    lang: "OMNI", langColor: "#00d4ff", difficulty: "beginner", category: "syntax",
    desc: "Core variable binding, shadowing, and Rust-style ownership within OMNI's native syntax.",
    tags: ["ownership", "borrow", "let", "mut"], docLink: "/docs/ownership",
    code: `/// ownership.omni
module ownership_demo

fn demonstrate_ownership() -> Result<(), Error> {
    // OMNI variables are immutable by default
    let name = "World"

    // Mutable binding
    let mut counter: i64 = 0
    counter += 1

    // Ownership moves
    let s1 = String::from("hello")
    let s2 = s1            // s1 is MOVED to s2
    // println(s1)         // ERROR: s1 is moved

    // Borrowing — no move
    let len = calculate_length(&s2)
    println("Length of '{}': {}", s2, len)

    // Shadowing
    let x = 5
    let x = x + 1         // new x, shadows old x
    let x = x * 2         // x = 12

    println("Counter: {}, x: {}", counter, x)
    Ok(())
}

fn calculate_length(s: &String) -> usize {
    s.len()               // borrow expires here
}

fn main() -> Result<(), Error> {
    demonstrate_ownership()
}`,
  },
  {
    id: 2, title: "Pattern Matching",
    lang: "OMNI", langColor: "#00d4ff", difficulty: "beginner", category: "syntax",
    desc: "Exhaustive match expressions with guards, tuple destructuring, and enum variants.",
    tags: ["match", "enum", "destructure", "guards"], docLink: "/docs/pattern-matching",
    code: `/// patterns.omni
module pattern_matching

enum Shape {
    Circle { radius: f64 },
    Rectangle { width: f64, height: f64 },
    Triangle { base: f64, height: f64 },
}

fn area(shape: &Shape) -> f64 {
    match shape {
        Shape::Circle { radius }           => std::f64::PI * radius * radius,
        Shape::Rectangle { width, height } => width * height,
        Shape::Triangle { base, height }   => 0.5 * base * height,
    }
}

fn classify(n: i64) -> &'static str {
    match n {
        i64::MIN..=-1 => "negative",
        0             => "zero",
        1..=9         => "single digit",
        10..=99       => "double digit",
        _             => "large",
    }
}

fn main() -> Result<(), Error> {
    let shapes = [
        Shape::Circle    { radius: 5.0 },
        Shape::Rectangle { width: 4.0, height: 6.0 },
        Shape::Triangle  { base: 3.0, height: 8.0 },
    ]

    for shape in &shapes {
        println!("Area: {:.2}", area(shape))
    }

    for n in [-5, 0, 7, 42, 1000] {
        println!("{}: {}", n, classify(n))
    }

    Ok(())
}`,
  },
  {
    id: 3, title: "Async / Await",
    lang: "OMNI", langColor: "#00d4ff", difficulty: "intermediate", category: "concurrency",
    desc: "Native async/await with structured concurrency and parallel task spawning.",
    tags: ["async", "await", "spawn", "join"], docLink: "/docs/async",
    code: `/// async_demo.omni
module async_example

use omni::async_std::{task, net};

async fn fetch_user(id: u64) -> Result<String, Error> {
    let url = format!("https://api.example.com/users/{}", id)
    let resp = net::get(&url).await?
    let body = resp.text().await?
    Ok(body)
}

async fn fetch_all_users(ids: Vec<u64>) -> Vec<Result<String, Error>> {
    // Spawn all tasks in parallel, then await all
    let handles: Vec<_> = ids
        .into_iter()
        .map(|id| task::spawn(fetch_user(id)))
        .collect()

    let mut results = Vec::new()
    for handle in handles {
        results.push(handle.await)
    }
    results
}

async fn pipeline() -> Result<(), Error> {
    let user_ids = vec![1, 2, 3, 4, 5]

    let t0      = std::time::Instant::now()
    let results = fetch_all_users(user_ids).await
    let elapsed = t0.elapsed()

    println!("Fetched {} users in {:?}", results.len(), elapsed)

    for (i, result) in results.iter().enumerate() {
        match result {
            Ok(data)  => println!("  User {}: {} bytes", i + 1, data.len()),
            Err(e)    => println!("  User {}: ERROR — {}", i + 1, e),
        }
    }
    Ok(())
}

fn main() -> Result<(), Error> {
    task::block_on(pipeline())
}`,
  },
  {
    id: 4, title: "Rust Bridge — Zero-Copy Buffers",
    lang: "Rust", langColor: "#e05d44", difficulty: "intermediate", category: "bridge",
    desc: "Using Rust inside .omni files for memory-safe, zero-copy buffer manipulation.",
    tags: ["@rust", "zero-copy", "bytes", "arena"], docLink: "/docs/rust-bridge",
    code: `/// rust_buffers.omni
module buffer_ops

@rust
use bytes::{Bytes, BytesMut};
use std::io::Write;

@rust
/// Arena-allocated ring buffer — zero heap fragmentation
pub struct RingBuffer {
    data:  Vec<u8>,
    head:  usize,
    tail:  usize,
    cap:   usize,
}

@rust
impl RingBuffer {
    pub fn new(capacity: usize) -> Self {
        Self { data: vec![0u8; capacity], head: 0, tail: 0, cap: capacity }
    }

    pub fn push(&mut self, byte: u8) -> bool {
        let next = (self.tail + 1) % self.cap
        if next == self.head { return false }  // full
        self.data[self.tail] = byte
        self.tail = next
        true
    }

    pub fn pop(&mut self) -> Option<u8> {
        if self.head == self.tail { return None } // empty
        let byte = self.data[self.head]
        self.head = (self.head + 1) % self.cap
        Some(byte)
    }

    pub fn len(&self) -> usize {
        (self.tail + self.cap - self.head) % self.cap
    }
}

fn main() -> Result<(), Error> {
    let mut buf = rust::RingBuffer::new(1024)

    // Write bytes
    for i in 0u8..100 {
        buf.push(i)
    }
    println!("Buffer size: {}", buf.len())  // 100

    // Drain
    let mut sum: u64 = 0
    while let Some(b) = buf.pop() {
        sum += b as u64
    }
    println!("Sum: {}", sum)  // 4950
    Ok(())
}`,
  },
  {
    id: 5, title: "Go Bridge — HTTP/3 Server",
    lang: "Go", langColor: "#00aed8", difficulty: "intermediate", category: "bridge",
    desc: "Build an HTTP/3 server with QUIC transport using Go inside .omni.",
    tags: ["@go", "http3", "quic", "tls"], docLink: "/docs/go-bridge",
    code: `/// http3_server.omni
module quic_api

@go
import (
    "context"
    "crypto/tls"
    "fmt"
    "net/http"
    "github.com/quic-go/quic-go/http3"
)

@go
type APIServer struct {
    mux    *http.ServeMux
    addr   string
    certFile string
    keyFile  string
}

@go
func NewServer(addr string) *APIServer {
    s := &APIServer{
        mux:      http.NewServeMux(),
        addr:     addr,
        certFile: "cert.pem",
        keyFile:  "key.pem",
    }

    s.mux.HandleFunc("/health", s.health)
    s.mux.HandleFunc("/api/v1/", s.apiRouter)
    return s
}

@go
func (s *APIServer) health(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    fmt.Fprintln(w, \`{"status":"ok","version":"2.0"}\`)
}

@go
func (s *APIServer) apiRouter(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, \`{"path":"%s","method":"%s"}\`, r.URL.Path, r.Method)
}

@go
func (s *APIServer) ListenAndServeH3(ctx context.Context) error {
    srv := &http3.Server{
        Addr:      s.addr,
        Handler:   s.mux,
        TLSConfig: &tls.Config{MinVersion: tls.VersionTLS13},
    }
    return srv.ListenAndServeTLS(s.certFile, s.keyFile)
}

fn main() -> Result<(), Error> {
    let server = go::NewServer(":4433")
    println!("HTTP/3 server on https://localhost:4433")
    let ctx = go::context::Background()
    go::goroutine(|| server.ListenAndServeH3(ctx))
    Ok(())
}`,
  },
  {
    id: 6, title: "Python Bridge — PyTorch Training",
    lang: "Python", langColor: "#ffd43b", difficulty: "advanced", category: "ml",
    desc: "Train a neural network with PyTorch inside .omni, then serve predictions from Rust.",
    tags: ["@python", "pytorch", "neural-net", "inference"], docLink: "/docs/python-bridge",
    code: `/// nn_train.omni
module neural_net

@python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(784, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 10),
        )

    def forward(self, x):
        return self.layers(x)

def train(epochs: int = 10) -> "Net":
    model = Net()
    optimizer = optim.Adam(model.parameters(), lr=1e-3)
    criterion = nn.CrossEntropyLoss()

    for epoch in range(epochs):
        model.train()
        # ... data loading + forward + backward
        print(f"Epoch {epoch+1}/{epochs} done")

    return model

def predict(model: "Net", x: list[float]) -> int:
    model.eval()
    with torch.no_grad():
        t = torch.tensor(x).unsqueeze(0)
        out = model(t)
        return int(out.argmax(dim=1).item())

@rust
use std::sync::{Arc, Mutex};

struct Classifier {
    model: Arc<Mutex<python::Net>>,
}

impl Classifier {
    fn new(epochs: u32) -> Self {
        let model = python::train(epochs);
        Self { model: Arc::new(Mutex::new(model)) }
    }

    fn classify(&self, pixels: &[f32]) -> u32 {
        let m = self.model.lock().unwrap();
        python::predict(&*m, pixels.to_vec()) as u32
    }
}

fn main() -> Result<(), Error> {
    let clf = rust::Classifier::new(5)
    let pixels = vec![0.0f32; 784]
    let label  = clf.classify(&pixels)
    println!("Predicted digit: {}", label)
    Ok(())
}`,
  },
  {
    id: 7, title: "TypeScript Bridge — React Component",
    lang: "TypeScript", langColor: "#3178c6", difficulty: "beginner", category: "web",
    desc: "Author React components with TypeScript inside .omni, consuming Go API data.",
    tags: ["@ts", "react", "hooks", "props"], docLink: "/docs/typescript-bridge",
    code: `/// dashboard.omni
module analytics_dashboard

@ts
import React, { useState, useEffect } from "react"

@ts
interface MetricCard {
    title:  string
    value:  number | string
    unit?:  string
    delta?: number
    color:  string
}

@ts
function MetricCard({ title, value, unit, delta, color }: MetricCard) {
    return (
        <div className="p-6 rounded-2xl border border-white/10 bg-slate-900">
            <p className="text-sm text-slate-400 mb-2">{title}</p>
            <p className="text-3xl font-black" style={{ color }}>
                {value}{unit && <span className="text-lg ml-1">{unit}</span>}
            </p>
            {delta !== undefined && (
                <p className={delta >= 0 ? "text-green-400 text-sm mt-1" : "text-red-400 text-sm mt-1"}>
                    {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
                </p>
            )}
        </div>
    )
}

@ts
export function Dashboard() {
    const [metrics, setMetrics] = useState<MetricCard[]>([])

    useEffect(() => {
        // Calls the Go API endpoint at build time
        fetch("/api/metrics").then(r => r.json()).then(setMetrics)
    }, [])

    return (
        <main className="p-8 grid grid-cols-4 gap-4">
            {metrics.map(m => <MetricCard key={m.title} {...m} />)}
        </main>
    )
}

@go
func MetricsHandler(w http.ResponseWriter, r *http.Request) {
    data := []map[string]any{
        {"title": "Requests/s", "value": 84321, "delta": 12, "color": "#00d4ff"},
        {"title": "P99 Latency","value": "4ms",  "delta": -8, "color": "#00ff88"},
    }
    json.NewEncoder(w).Encode(data)
}`,
  },
  {
    id: 8, title: "C Bridge — SIMD Intrinsics",
    lang: "C", langColor: "#555599", difficulty: "advanced", category: "systems",
    desc: "AVX2 SIMD vectorization for dot products using C inside .omni.",
    tags: ["@c", "avx2", "simd", "intrinsics"], docLink: "/docs/c-bridge",
    code: `/// simd_math.omni
module vector_math

@c
#include <immintrin.h>
#include <stdint.h>
#include <string.h>

// AVX2: 8 floats at a time — 8x throughput
float dot_product_avx2(
    const float* a,
    const float* b,
    int           n
) {
    __m256 sum = _mm256_setzero_ps();
    int    i   = 0;

    // Process 8 elements per iteration
    for (; i <= n - 8; i += 8) {
        __m256 va = _mm256_loadu_ps(a + i);
        __m256 vb = _mm256_loadu_ps(b + i);
        sum = _mm256_fmadd_ps(va, vb, sum);  // fused multiply-add
    }

    // Horizontal reduction
    __m128 hi  = _mm256_extractf128_ps(sum, 1);
    __m128 lo  = _mm256_castps256_ps128(sum);
    __m128 res = _mm_add_ps(lo, hi);
    res = _mm_hadd_ps(res, res);
    res = _mm_hadd_ps(res, res);
    float result = _mm_cvtss_f32(res);

    // Scalar remainder
    for (; i < n; i++) result += a[i] * b[i];
    return result;
}

@rust
fn benchmark_dot(n: usize) {
    let a: Vec<f32> = (0..n).map(|i| i as f32).collect();
    let b: Vec<f32> = (0..n).map(|i| (i * 2) as f32).collect();

    let t0  = std::time::Instant::now();
    let dot = c::dot_product_avx2(a.as_ptr(), b.as_ptr(), n as i32);
    let ms  = t0.elapsed().as_micros();

    println!("dot({}) = {:.2}  [{} µs]", n, dot, ms);
}

fn main() -> Result<(), Error> {
    rust::benchmark_dot(1_000_000)
    rust::benchmark_dot(10_000_000)
    Ok(())
}`,
  },
  {
    id: 9, title: "Julia Bridge — Linear Algebra",
    lang: "Julia", langColor: "#9558b2", difficulty: "advanced", category: "ml",
    desc: "Matrix decomposition and eigenvalue computation with Julia inside .omni.",
    tags: ["@julia", "linalg", "eigen", "SVD"], docLink: "/docs/julia-bridge",
    code: `/// linalg.omni
module linear_algebra

@julia
using LinearAlgebra, Statistics

function solve_least_squares(A::Matrix{Float64}, b::Vector{Float64})
    # QR decomposition — numerically stable
    F = qr(A)
    x = F \\ b
    residual = norm(A * x - b)
    return x, residual
end

function pca(data::Matrix{Float64}, k::Int)
    # Subtract mean
    μ  = mean(data, dims=1)
    X  = data .- μ

    # SVD decomposition
    U, S, Vt = svd(X)

    # Top-k principal components
    components = Vt[1:k, :]
    scores     = X * components'
    variance   = S[1:k] .^ 2 ./ sum(S .^ 2)

    return scores, components, variance
end

function eigenvalues_of_covariance(data::Matrix{Float64})
    C      = cov(data)
    vals   = eigvals(C)
    sorted = sort(vals, rev=true)
    return sorted
end

@rust
fn run_pca(n_samples: usize, n_features: usize, n_components: usize) {
    // Generate random data
    let data: Vec<f64> = (0..n_samples * n_features)
        .map(|_| rand::random::<f64>())
        .collect()

    let (scores, components, variance) =
        julia::pca(data, n_samples, n_features, n_components)

    for (i, v) in variance.iter().enumerate() {
        println!("PC{}: {:.1}% variance", i + 1, v * 100.0)
    }
}

fn main() -> Result<(), Error> {
    rust::run_pca(1000, 50, 5)
    Ok(())
}`,
  },
  {
    id: 10, title: "Swift Bridge — Native iOS UI",
    lang: "Swift", langColor: "#ff5c00", difficulty: "intermediate", category: "bridge",
    desc: "SwiftUI views bridged to an OMNI backend, sharing data via DomainBridge.",
    tags: ["@swift", "swiftui", "ios", "native"], docLink: "/docs/swift-bridge",
    code: `/// ios_app.omni
module todo_ios

@swift
import SwiftUI
import Combine

@swift
struct Todo: Identifiable, Codable {
    let id: UUID
    var title: String
    var done: Bool
}

@swift
class TodoViewModel: ObservableObject {
    @Published var todos: [Todo] = []
    @Published var newTitle = ""

    func load() {
        // DomainBridge call → Go HTTP API
        Task {
            let data = try await OmniBridge.call("GetTodos")
            todos = try JSONDecoder().decode([Todo].self, from: data)
        }
    }

    func add() {
        guard !newTitle.isEmpty else { return }
        let todo = Todo(id: .init(), title: newTitle, done: false)
        todos.append(todo)
        newTitle = ""
        Task { try await OmniBridge.call("AddTodo", body: todo) }
    }
}

@swift
struct ContentView: View {
    @StateObject var vm = TodoViewModel()

    var body: some View {
        NavigationView {
            List {
                ForEach(vm.todos) { todo in
                    HStack {
                        Image(systemName: todo.done ? "checkmark.circle.fill" : "circle")
                            .foregroundColor(todo.done ? .green : .gray)
                        Text(todo.title)
                    }
                }
            }
            .navigationTitle("OMNI Todos")
            .onAppear { vm.load() }
        }
    }
}

@go
func GetTodos(w http.ResponseWriter, r *http.Request) {
    json.NewEncoder(w).Encode(todoStore)
}

fn main() -> Result<(), Error> {
    swift::run_app::<swift::ContentView>()
}`,
  },
  {
    id: 11, title: "R Bridge — Statistical Analysis",
    lang: "R", langColor: "#276dc3", difficulty: "intermediate", category: "ml",
    desc: "Run R statistical tests and ggplot2 charts from within .omni.",
    tags: ["@r", "statistics", "ggplot2", "regression"], docLink: "/docs/r-bridge",
    code: `/// stats.omni
module statistical_analysis

@r
library(ggplot2)
library(dplyr)
library(tidyr)

perform_anova <- function(groups: list) {
    df <- data.frame(
        value = unlist(groups),
        group = rep(names(groups), lengths(groups))
    )
    model  <- aov(value ~ group, data = df)
    result <- summary(model)
    pvalue <- result[[1]][["Pr(>F)"]][1]
    return(list(pvalue = pvalue, significant = pvalue < 0.05))
}

linear_regression <- function(x: numeric, y: numeric) {
    df    <- data.frame(x = x, y = y)
    model <- lm(y ~ x, data = df)
    r2    <- summary(model)$r.squared
    coefs <- coef(model)
    return(list(
        intercept = coefs[1],
        slope     = coefs[2],
        r_squared = r2
    ))
}

plot_regression <- function(x: numeric, y: numeric, path: character) {
    df <- data.frame(x = x, y = y)
    p  <- ggplot(df, aes(x, y)) +
              geom_point(color = "#00d4ff", alpha = 0.7) +
              geom_smooth(method = "lm", color = "#a855f7") +
              theme_dark()
    ggsave(path, p, width = 8, height = 6)
}

@rust
fn analyze_experiment(data: &[(f64, f64)]) {
    let x: Vec<f64> = data.iter().map(|(x, _)| *x).collect()
    let y: Vec<f64> = data.iter().map(|(_, y)| *y).collect()

    let result = r::linear_regression(&x, &y)
    println!("Slope:     {:.4}", result.slope)
    println!("Intercept: {:.4}", result.intercept)
    println!("R²:        {:.4}", result.r_squared)

    r::plot_regression(&x, &y, "output/regression.png")
    println!("Chart saved to output/regression.png")
}

fn main() -> Result<(), Error> {
    let data: Vec<(f64, f64)> = (0..100)
        .map(|i| (i as f64, i as f64 * 2.5 + 3.0 + rand::f64() * 10.0))
        .collect()
    rust::analyze_experiment(&data)
    Ok(())
}`,
  },
  {
    id: 12, title: "GraphQL Bridge — Schema + Resolvers",
    lang: "GraphQL", langColor: "#e10098", difficulty: "intermediate", category: "web",
    desc: "Define a GraphQL schema with @graphql and implement resolvers in Go.",
    tags: ["@graphql", "schema", "resolver", "subscriptions"], docLink: "/docs/graphql-bridge",
    code: `/// graphql_api.omni
module graphql_service

@graphql
type User {
    id:        ID!
    name:      String!
    email:     String!
    posts:     [Post!]!
    createdAt: DateTime!
}

@graphql
type Post {
    id:        ID!
    title:     String!
    body:      String!
    author:    User!
    likes:     Int!
    tags:      [String!]!
}

@graphql
type Query {
    user(id: ID!):           User
    users(limit: Int = 10):  [User!]!
    post(id: ID!):           Post
    posts(tag: String):      [Post!]!
    search(query: String!):  [Post!]!
}

@graphql
type Mutation {
    createUser(name: String!, email: String!): User!
    createPost(authorId: ID!, title: String!, body: String!): Post!
    likePost(postId: ID!): Post!
}

@graphql
type Subscription {
    postLiked(postId: ID!): Post!
    newPost(tag: String):   Post!
}

@go
import "github.com/graphql-go/graphql"

func UserResolver(p graphql.ResolveParams) (interface{}, error) {
    id := p.Args["id"].(string)
    return db.FindUser(id)
}

func PostsResolver(p graphql.ResolveParams) (interface{}, error) {
    tag := p.Args["tag"]
    if tag == nil {
        return db.AllPosts()
    }
    return db.PostsByTag(tag.(string))
}

fn main() -> Result<(), Error> {
    let schema = graphql::build_schema()
    let server = go::NewServer(":8080")
    server.Handle("/graphql", graphql::Handler(schema))
    println!("GraphQL running at http://localhost:8080/graphql")
    Ok(())
}`,
  },
  {
    id: 13, title: "C++ Bridge — Game Physics",
    lang: "C++", langColor: "#004488", difficulty: "advanced", category: "systems",
    desc: "Integrate a Bullet Physics C++ rigid body simulation with OMNI's game loop.",
    tags: ["@cpp", "bullet", "physics", "simulation"], docLink: "/docs/cpp-bridge",
    code: `/// physics_sim.omni
module game_physics

@cpp
#include <btBulletDynamicsCommon.h>
#include <memory>

class PhysicsWorld {
    std::unique_ptr<btBroadphaseInterface>        broadphase;
    std::unique_ptr<btCollisionDispatcher>         dispatcher;
    std::unique_ptr<btConstraintSolver>            solver;
    std::unique_ptr<btDiscreteDynamicsWorld>       world;
    std::vector<btRigidBody*>                      bodies;

public:
    PhysicsWorld() {
        auto config  = new btDefaultCollisionConfiguration();
        dispatcher   = std::make_unique<btCollisionDispatcher>(config);
        broadphase   = std::make_unique<btDbvtBroadphase>();
        solver       = std::make_unique<btSequentialImpulseConstraintSolver>();
        world        = std::make_unique<btDiscreteDynamicsWorld>(
            dispatcher.get(), broadphase.get(), solver.get(), config
        );
        world->setGravity(btVector3(0, -9.81f, 0));
    }

    btRigidBody* addSphere(float x, float y, float z, float radius, float mass) {
        auto shape   = new btSphereShape(radius);
        btTransform t; t.setIdentity();
        t.setOrigin(btVector3(x, y, z));
        btVector3 inertia(0, 0, 0);
        shape->calculateLocalInertia(mass, inertia);
        auto motion  = new btDefaultMotionState(t);
        auto info    = btRigidBody::btRigidBodyConstructionInfo(mass, motion, shape, inertia);
        auto body    = new btRigidBody(info);
        world->addRigidBody(body);
        bodies.push_back(body);
        return body;
    }

    void step(float dt) { world->stepSimulation(dt, 10); }

    std::tuple<float,float,float> getPosition(btRigidBody* body) {
        btTransform t; body->getMotionState()->getWorldTransform(t);
        auto o = t.getOrigin();
        return {o.x(), o.y(), o.z()};
    }
};

@rust
fn simulate(frames: u32) {
    let mut world  = cpp::PhysicsWorld::new()
    let ball       = world.add_sphere(0.0, 10.0, 0.0, 1.0, 1.0)
    let _ground    = world.add_sphere(0.0, -50.0, 0.0, 50.0, 0.0)  // mass=0 = static

    for frame in 0..frames {
        world.step(1.0 / 60.0)
        let (x, y, z) = world.get_position(ball)
        if frame % 30 == 0 {
            println!("Frame {:4}: ball pos = ({:.2}, {:.2}, {:.2})", frame, x, y, z)
        }
    }
}

fn main() -> Result<(), Error> {
    rust::simulate(300)
    Ok(())
}`,
  },
  {
    id: 14, title: "Ruby Bridge — Configuration DSL",
    lang: "Ruby", langColor: "#cc342d", difficulty: "beginner", category: "bridge",
    desc: "Use Ruby's meta-programming to build fluent DSLs for OMNI configuration.",
    tags: ["@ruby", "dsl", "meta", "config"], docLink: "/docs/ruby-bridge",
    code: `/// config_dsl.omni
module app_config

@ruby
# Fluent DSL using method_missing + blocks
class OmniConfig
  attr_reader :settings

  def initialize
    @settings = {}
  end

  def database(&block)
    @settings[:database] = DatabaseConfig.new.tap { |c| c.instance_eval(&block) }
  end

  def server(&block)
    @settings[:server] = ServerConfig.new.tap { |c| c.instance_eval(&block) }
  end

  def method_missing(name, *args)
    @settings[name] = args.first
  end
end

class DatabaseConfig
  attr_accessor :host, :port, :name, :pool_size

  def initialize
    @pool_size = 5
  end
end

class ServerConfig
  attr_accessor :host, :port, :workers, :timeout

  def initialize
    @workers = 4
    @timeout = 30
  end
end

def configure(&block)
  c = OmniConfig.new
  c.instance_eval(&block)
  c.settings
end

@rust
fn load_config() -> AppConfig {
    let cfg = ruby::configure(r#"
        database do
            host "localhost"
            port 5432
            name "omni_prod"
            pool_size 20
        end

        server do
            host "0.0.0.0"
            port 8080
            workers 8
            timeout 60
        end

        log_level "info"
        debug false
    "#)

    AppConfig {
        db_host:  cfg["database"]["host"].to_string(),
        db_port:  cfg["database"]["port"].as_u64().unwrap() as u16,
        srv_port: cfg["server"]["port"].as_u64().unwrap() as u16,
    }
}`,
  },
  {
    id: 15, title: "PHP Bridge — WordPress Plugin",
    lang: "PHP", langColor: "#777bb4", difficulty: "intermediate", category: "bridge",
    desc: "Write a WordPress plugin in PHP inside .omni, calling Rust for heavy computation.",
    tags: ["@php", "wordpress", "plugin", "hooks"], docLink: "/docs/php-bridge",
    code: `/// wp_plugin.omni
module wordpress_plugin

@php
<?php
/**
 * Plugin Name: OMNI Analytics
 * Description: Fast analytics powered by OMNI Rust backend
 * Version:     1.0.0
 */

class OmniAnalytics {
    private string $api_url;

    public function __construct(string $api_url) {
        $this->api_url = $api_url;
        add_action('wp_head',        [$this, 'inject_tracker']);
        add_action('rest_api_init',  [$this, 'register_routes']);
        add_shortcode('omni_stats',  [$this, 'render_stats']);
    }

    public function inject_tracker(): void {
        echo '<script>
            fetch("' . esc_url($this->api_url) . '/track", {
                method: "POST",
                body: JSON.stringify({ url: location.href, ts: Date.now() })
            })
        </script>';
    }

    public function register_routes(): void {
        register_rest_route("omni/v1", "/stats", [
            "methods"  => "GET",
            "callback" => [$this, "get_stats"],
            "permission_callback" => "__return_true",
        ]);
    }

    public function get_stats(WP_REST_Request $req): WP_REST_Response {
        $days = (int) $req->get_param("days") ?: 7;
        $data = $this->fetch_from_rust($days);
        return new WP_REST_Response($data);
    }

    private function fetch_from_rust(int $days): array {
        $resp = wp_remote_get($this->api_url . "/aggregate?days=" . $days);
        return json_decode(wp_remote_retrieve_body($resp), true);
    }

    public function render_stats(array $atts): string {
        $days = (int) ($atts["days"] ?? 7);
        $stats = $this->fetch_from_rust($days);
        return sprintf(
            "<div class='omni-stats'>%d visits in last %d days</div>",
            $stats["visits"] ?? 0, $days
        );
    }
}

new OmniAnalytics(OMNI_API_URL);

@rust
#[derive(serde::Serialize)]
struct AggregateStats { visits: u64, unique: u64, bounce_rate: f32 }

fn aggregate(days: u32) -> AggregateStats {
    // Query time-series DB
    let visits = db::count_events("pageview", days)
    AggregateStats { visits, unique: visits / 3, bounce_rate: 0.42 }
}`,
  },
  {
    id: 16, title: "JavaScript Bridge — Node.js Worker",
    lang: "JavaScript", langColor: "#f7df1e", difficulty: "beginner", category: "bridge",
    desc: "Run Node.js worker threads inside .omni for CPU-intensive JS tasks.",
    tags: ["@js", "node", "workers", "async"], docLink: "/docs/js-bridge",
    code: `/// node_worker.omni
module js_workers

@js
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads")

@js
// Worker thread code
if (!isMainThread) {
    const { data, operation } = workerData

    let result
    switch (operation) {
        case "sort":
            result = [...data].sort((a, b) => a - b)
            break
        case "sum":
            result = data.reduce((acc, n) => acc + n, 0)
            break
        case "fibonacci":
            const fib = (n) => n <= 1 ? n : fib(n-1) + fib(n-2)
            result = data.map(n => ({ n, fib: fib(n) }))
            break
        default:
            result = data
    }

    parentPort.postMessage({ result, workerPid: process.pid })
}

@js
// Main thread — spawn N workers in parallel
async function parallelProcess(chunks, operation) {
    const promises = chunks.map(chunk =>
        new Promise((resolve, reject) => {
            const w = new Worker(__filename, {
                workerData: { data: chunk, operation }
            })
            w.on("message", resolve)
            w.on("error",   reject)
        })
    )
    return Promise.all(promises)
}

@js
module.exports = { parallelProcess }

@go
import "github.com/dop251/goja"

func runJSWorkers(chunks [][]float64) []float64 {
    vm := goja.New()
    vm.RunFile("dist/node_worker.js")
    fn, _ := goja.AssertFunction(vm.Get("parallelProcess"))

    results := make([]float64, 0)
    // ... call and collect results
    return results
}`,
  },
  {
    id: 17, title: "C# Bridge — Entity Framework",
    lang: "C#", langColor: "#512bd4", difficulty: "intermediate", category: "bridge",
    desc: "Use Entity Framework Core from C# inside .omni for ORM-based database access.",
    tags: ["@cs", "ef-core", "linq", "migrations"], docLink: "/docs/csharp-bridge",
    code: `/// database.omni
module entity_framework

@cs
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

@cs
public record Product(
    [Key] int Id,
    [MaxLength(200)] string Name,
    decimal Price,
    int StockCount,
    DateTime CreatedAt
);

@cs
public class AppDbContext : DbContext {
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder m) {
        m.Entity<Product>()
         .HasIndex(p => p.Name).IsUnique();
    }
}

@cs
public class ProductRepository {
    private readonly AppDbContext _db;
    public ProductRepository(AppDbContext db) => _db = db;

    public async Task<List<Product>> GetAllAsync() =>
        await _db.Products
            .OrderBy(p => p.Name)
            .ToListAsync();

    public async Task<List<Product>> SearchAsync(string query) =>
        await _db.Products
            .Where(p => EF.Functions.Like(p.Name, $"%{query}%"))
            .ToListAsync();

    public async Task<Product> UpsertAsync(Product product) {
        var existing = await _db.Products.FindAsync(product.Id);
        if (existing is null) _db.Products.Add(product);
        else _db.Entry(existing).CurrentValues.SetValues(product);
        await _db.SaveChangesAsync();
        return product;
    }
}

@go
func ProductsHandler(w http.ResponseWriter, r *http.Request) {
    q    := r.URL.Query().Get("q")
    repo := csharp.NewProductRepository()

    var products []csharp.Product
    if q != "" {
        products, _ = repo.SearchAsync(q)
    } else {
        products, _ = repo.GetAllAsync()
    }
    json.NewEncoder(w).Encode(products)
}`,
  },
  {
    id: 18, title: "Error Handling — Result & Option",
    lang: "OMNI", langColor: "#00d4ff", difficulty: "beginner", category: "syntax",
    desc: "Monadic error handling with Result<T,E>, the ? operator, and custom error types.",
    tags: ["result", "option", "error", "?"], docLink: "/docs/error-handling",
    code: `/// errors.omni
module error_handling

use omni::error::{Error, ErrorKind};

// Custom error type
#[derive(Debug)]
enum AppError {
    Io(omni::io::Error),
    Parse { line: usize, msg: String },
    Network(String),
    NotFound { resource: String, id: u64 },
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            AppError::Io(e)          => write!(f, "I/O error: {e}"),
            AppError::Parse { line, msg } =>
                write!(f, "Parse error at line {line}: {msg}"),
            AppError::Network(msg)   => write!(f, "Network error: {msg}"),
            AppError::NotFound { resource, id } =>
                write!(f, "{resource} #{id} not found"),
        }
    }
}

// The ? operator propagates errors automatically
fn read_config(path: &str) -> Result<Config, AppError> {
    let text = omni::fs::read_to_string(path)
        .map_err(AppError::Io)?         // converts io::Error to AppError

    let config: Config = toml::from_str(&text)
        .map_err(|e| AppError::Parse { line: 0, msg: e.to_string() })?

    Ok(config)
}

// Option — absence without panic
fn find_user(id: u64) -> Option<User> {
    USER_DB.iter().find(|u| u.id == id).cloned()
}

fn main() -> Result<(), AppError> {
    // if read_config fails, error propagates up with ?
    let config = read_config("omni.toml")?

    let user = find_user(42)
        .ok_or(AppError::NotFound { resource: "User".into(), id: 42 })?

    println!("User: {} (config v{})", user.name, config.version)
    Ok(())
}`,
  },
  {
    id: 19, title: "Generics & Traits",
    lang: "OMNI", langColor: "#00d4ff", difficulty: "intermediate", category: "syntax",
    desc: "Polymorphic functions, trait bounds, associated types, and where clauses.",
    tags: ["generics", "traits", "bounds", "associated-types"], docLink: "/docs/generics",
    code: `/// generics.omni
module generics_demo

// Trait definition
trait Summary {
    fn summarize(&self) -> String;
    fn preview(&self) -> String {
        format!("{}...", &self.summarize()[..50.min(self.summarize().len())])
    }
}

// Structs implementing the trait
struct Article { title: String, content: String }
struct Tweet   { user: String, text: String }

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("{}: {}", self.title, self.content)
    }
}

impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("@{}: {}", self.user, self.text)
    }
}

// Generic function with trait bound
fn notify<T: Summary>(item: &T) {
    println!("Breaking news! {}", item.summarize())
}

// Multiple bounds
fn display_and_summarize<T>(item: &T)
where
    T: Summary + std::fmt::Debug + Clone
{
    let copy = item.clone()
    println!("{:?}", copy)
    println!("{}", item.summarize())
}

// Generic struct with associated type
struct Wrapper<T: Summary> { inner: T }

impl<T: Summary> Wrapper<T> {
    fn new(inner: T) -> Self { Wrapper { inner } }
    fn summarize(&self) -> String { self.inner.summarize() }
}

fn main() -> Result<(), Error> {
    let article = Article { title: "OMNI v2".into(), content: "Released!".into() }
    let tweet   = Tweet   { user: "omnilang".into(), text: "Ship it!".into() }

    notify(&article)
    notify(&tweet)

    let wrapped = Wrapper::new(article)
    println!("{}", wrapped.summarize())

    Ok(())
}`,
  },
  {
    id: 20, title: "Macros — Code Generation",
    lang: "OMNI", langColor: "#00d4ff", difficulty: "advanced", category: "syntax",
    desc: "Declarative and procedural macros for zero-cost code generation.",
    tags: ["macros", "derive", "proc-macro", "metaprogramming"], docLink: "/docs/macros",
    code: `/// macros.omni
module macro_demo

// Declarative macro — creates repeated code
macro_rules! vec_of_strings {
    ($($x:expr),*) => {
        vec![$($x.to_string()),*]
    };
}

// Derive macro usage
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
struct Config {
    host:     String,
    port:     u16,
    debug:    bool,
    max_conn: u32,
}

// Custom derive procedural macro (defined externally)
#[derive(Builder)]
struct HttpRequest {
    url:     String,
    method:  String,
    headers: Vec<(String, String)>,
    body:    Option<Vec<u8>>,
    timeout: u64,
}

// Macro for route registration
macro_rules! route {
    (GET $path:literal => $handler:expr) => {
        router.get($path, $handler)
    };
    (POST $path:literal => $handler:expr) => {
        router.post($path, $handler)
    };
    (DELETE $path:literal => $handler:expr) => {
        router.delete($path, $handler)
    };
}

fn main() -> Result<(), Error> {
    let langs = vec_of_strings!["rust", "go", "python", "ts"]
    println!("{:?}", langs)

    // Using the builder pattern from #[derive(Builder)]
    let req = HttpRequest::builder()
        .url("https://api.example.com")
        .method("GET")
        .timeout(30)
        .build()?

    let mut router = Router::new()
    route!(GET "/users"      => handle_users)
    route!(POST "/users"     => create_user)
    route!(DELETE "/users/:id" => delete_user)

    Ok(())
}`,
  },
  {
    id: 21, title: "Testing — Unit & Integration",
    lang: "OMNI", langColor: "#00d4ff", difficulty: "beginner", category: "testing",
    desc: "Built-in test runner with assertions, property-based testing, and mocking.",
    tags: ["test", "assert", "mock", "proptest"], docLink: "/docs/testing",
    code: `/// calculator_test.omni
module calculator

fn add(a: i64, b: i64) -> i64 { a + b }
fn div(a: f64, b: f64) -> Result<f64, Error> {
    if b == 0.0 { return Err(Error::new("division by zero")) }
    Ok(a / b)
}

#[cfg(test)]
mod tests {
    use super::*
    use omni::test::{assert_eq, assert_err, prop_assert};

    // Unit test
    #[test]
    fn test_add_basic() {
        assert_eq!(add(2, 3), 5)
        assert_eq!(add(-1, 1), 0)
        assert_eq!(add(i64::MAX, 0), i64::MAX)
    }

    // Error case
    #[test]
    fn test_div_by_zero() {
        assert_err!(div(10.0, 0.0))
    }

    #[test]
    fn test_div_ok() {
        let result = div(10.0, 4.0).unwrap()
        assert!((result - 2.5).abs() < f64::EPSILON)
    }

    // Property-based test (runs 1000 random cases)
    #[test]
    fn prop_add_commutative() {
        proptest!(|a: i64, b: i64| {
            prop_assert!(add(a, b) == add(b, a))
        })
    }

    // Integration test with mock
    #[test]
    fn test_http_handler() {
        let mock_db = MockDatabase::new()
            .expect_find_user(42, Ok(User { id: 42, name: "Alice" }))

        let handler = UserHandler::new(mock_db)
        let req     = TestRequest::get("/users/42")
        let resp    = handler.handle(req)

        assert_eq!(resp.status(), 200)
        assert!(resp.body().contains("Alice"))
    }
}`,
  },
  {
    id: 22, title: "Concurrency — Goroutines + Channels",
    lang: "Go", langColor: "#00aed8", difficulty: "intermediate", category: "concurrency",
    desc: "Producer-consumer pipelines with buffered channels and select statements.",
    tags: ["@go", "goroutine", "channel", "select"], docLink: "/docs/concurrency",
    code: `/// pipeline.omni
module concurrent_pipeline

@go
import (
    "context"
    "runtime"
    "sync"
)

// Stage 1 — generate numbers
@go
func generate(ctx context.Context, nums ...int) <-chan int {
    out := make(chan int, len(nums))
    go func() {
        defer close(out)
        for _, n := range nums {
            select {
            case <-ctx.Done(): return
            case out <- n:
            }
        }
    }()
    return out
}

// Stage 2 — square each number (fan-out)
@go
func square(ctx context.Context, in <-chan int) <-chan int {
    out := make(chan int, 128)
    go func() {
        defer close(out)
        for n := range in {
            select {
            case <-ctx.Done(): return
            case out <- n * n:
            }
        }
    }()
    return out
}

// Fan-out to N workers, fan-in results
@go
func parallelSquare(ctx context.Context, in <-chan int, n int) <-chan int {
    channels := make([]<-chan int, n)
    for i := range channels {
        channels[i] = square(ctx, in)
    }
    return merge(channels...)
}

@go
func merge(channels ...<-chan int) <-chan int {
    out := make(chan int, 256)
    var wg sync.WaitGroup
    for _, c := range channels {
        wg.Add(1)
        go func(ch <-chan int) {
            defer wg.Done()
            for v := range ch { out <- v }
        }(c)
    }
    go func() { wg.Wait(); close(out) }()
    return out
}

fn main() -> Result<(), Error> {
    let ctx    = go::context::Background()
    let nums   = go::generate(ctx, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
    let cores  = go::runtime::NumCPU()
    let result = go::parallelSquare(ctx, nums, cores)

    let mut sum: i64 = 0
    for v in result {
        sum += v as i64
    }
    println!("Sum of squares: {}", sum)  // 385
    Ok(())
}`,
  },
  {
    id: 23, title: "OMNI-NEXUS — Publishing a Package",
    lang: "OMNI", langColor: "#00d4ff", difficulty: "beginner", category: "deploy",
    desc: "Create, document, and publish a package to the OMNI-NEXUS registry.",
    tags: ["nexus", "package", "publish", "omnifile"], docLink: "/docs/nexus-publish",
    code: `## Omnifile.toml — package manifest

[package]
name        = "omni-jwt"
version     = "1.2.0"
description = "Fast JWT sign/verify across Rust + Go in one package"
authors     = ["Your Name <you@example.com>"]
license     = "MIT"
repository  = "https://github.com/you/omni-jwt"
readme      = "README.md"
keywords    = ["jwt", "auth", "cryptography"]
categories  = ["security", "web"]

[languages]
rust    = "1.75"
go      = "1.22"

[dependencies]
omni-std   = "2.0"
hmac       = { version = "0.12", lang = "rust" }
sha2       = { version = "0.10", lang = "rust" }
golang-jwt = { version = "5",   lang = "go"   }

[dev-dependencies]
omni-test  = "1.0"

[features]
default     = ["hs256"]
hs256       = []
rs256       = ["rsa"]
ed25519     = ["ed25519-dalek"]

## Publishing workflow:
##   omni login
##   omni test
##   omni build --release
##   omni publish

## Then anyone installs with:
##   omni add omni-jwt`,
  },
  {
    id: 24, title: "Deploy — Unikernel to Vercel Edge",
    lang: "OMNI", langColor: "#00d4ff", difficulty: "beginner", category: "deploy",
    desc: "Full deployment flow from source to Vercel edge using omni build + deploy.",
    tags: ["deploy", "vercel", "unikernel", "edge"], docLink: "/docs/edge-deploy",
    code: `## Step 1 — Build release binary
$ omni build --release --target vercel-edge

[LLVM-Omni] Parsing 3 language domains...
[UAST]      Merging AST: 1,247 nodes
[LLVM]      Vectorize: 4.1x SIMD speedup
[LLVM]      Dead-code-elim: 12.4 KB removed
[PACK]      Binary: 4.7 MB  Unikernel: 6.1 MB
Build complete in 3.6s

## Step 2 — Deploy to Vercel (opens browser for auth)
$ omni deploy --target vercel

Deploying to Vercel Edge Network...
  Region: iad1 (us-east)    ✓  2.1s
  Region: nrt1 (japan)      ✓  3.4s
  Region: lhr1 (uk)         ✓  2.8s
  ...43 regions total

Health checks:
  GET /health → 200 OK (3ms) ✓
  GET /api/v1 → 200 OK (4ms) ✓

✓ Deployed: https://my-omni-app.vercel.app
  Cold start: 7ms
  Binary:     4.7 MB

## Step 3 — CI/CD (GitHub Actions)
# .github/workflows/deploy.yml
name: Deploy OMNI
on: push:
  branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: omni-lang/setup-omni@v2
        with: { version: "2.0" }
      - run: omni test
      - run: omni deploy --target vercel
        env:
          VERCEL_TOKEN: \${{ secrets.VERCEL_TOKEN }}`,
  },
  {
    id: 25, title: "HTML Bridge — Server Templates",
    lang: "HTML", langColor: "#e44d26", difficulty: "beginner", category: "web",
    desc: "Server-side HTML template rendering with data from Rust/Go domains.",
    tags: ["@html", "templates", "ssr", "forms"], docLink: "/docs/html-bridge",
    code: `/// templates.omni
module html_templates

@html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }} | OMNI App</title>
    <link rel="stylesheet" href="/static/app.css">
</head>
<body class="dark">
    <header>
        <nav>
            <a href="/" class="logo">OMNI</a>
            <ul>
                <li><a href="/products">Products</a></li>
                <li><a href="/docs">Docs</a></li>
            </ul>
        </nav>
    </header>

    <main>
        {% if user %}
        <p>Welcome back, {{ user.name }}!</p>
        {% else %}
        <p>Please <a href="/login">sign in</a>.</p>
        {% endif %}

        <section class="products">
        {% for product in products %}
            <div class="card">
                <h2>{{ product.name }}</h2>
                <p class="price">{{ product.price | currency }}</p>
                <form method="POST" action="/cart/add">
                    <input type="hidden" name="id" value="{{ product.id }}">
                    <button type="submit">Add to Cart</button>
                </form>
            </div>
        {% endfor %}
        </section>
    </main>
</body>
</html>

@rust
fn render_products(user: Option<&User>, products: &[Product]) -> String {
    let ctx = TemplateContext::new()
        .set("title", "Products")
        .set("user", user)
        .set("products", products)
    html::render("templates/products.html", ctx)
}`,
  },
]

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const DIFFICULTIES: { id: Difficulty; label: string; color: string }[] = [
  { id: "beginner",     label: "Beginner",     color: "#00ff88" },
  { id: "intermediate", label: "Intermediate", color: "#f59e0b" },
  { id: "advanced",     label: "Advanced",     color: "#ef4444" },
]

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "syntax",      label: "Syntax"       },
  { id: "bridge",      label: "Language Bridges" },
  { id: "stdlib",      label: "Standard Library" },
  { id: "patterns",    label: "Patterns"     },
  { id: "deploy",      label: "Deployment"   },
  { id: "ml",          label: "ML / AI"      },
  { id: "web",         label: "Web"          },
  { id: "systems",     label: "Systems"      },
  { id: "concurrency", label: "Concurrency"  },
  { id: "testing",     label: "Testing"      },
]

const LANG_COLORS: Record<string, string> = {
  "OMNI":       "#00d4ff",
  "Rust":       "#e05d44",
  "Go":         "#00aed8",
  "Python":     "#ffd43b",
  "TypeScript": "#3178c6",
  "C":          "#555599",
  "C++":        "#004488",
  "Julia":      "#9558b2",
  "Swift":      "#ff5c00",
  "R":          "#276dc3",
  "HTML":       "#e44d26",
  "GraphQL":    "#e10098",
  "C#":         "#512bd4",
  "Ruby":       "#cc342d",
  "PHP":        "#777bb4",
  "JavaScript": "#f7df1e",
}

/* ─────────────────────────────────────────────────────────────
   STUDY CARD
───────────────────────────────────────────────────────────── */
function StudyCard({ study, onSelect }: { study: Study; onSelect: (s: Study) => void }) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-30px 0px" })
  const color  = study.langColor

  return (
    <motion.div
      ref={ref}
      className="flex flex-col p-5 rounded-2xl border border-white/[0.07] bg-[#0d1117] cursor-pointer relative overflow-hidden group"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      whileHover={{ y: -4, borderColor: `${color}35`, boxShadow: `0 12px 40px ${color}12` }}
      onClick={() => onSelect(study)}
    >
      {/* Glow */}
      <motion.div className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(circle at 0% 0%, ${color}0a, transparent 60%)` }}
        initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.3 }} aria-hidden="true" />
      {/* Top accent */}
      <motion.div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
        initial={{ scaleX: 0, opacity: 0 }} whileHover={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.4 }} aria-hidden="true" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest"
            style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
            {study.lang}
          </span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
            study.difficulty === "beginner"     ? "bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/25" :
            study.difficulty === "intermediate" ? "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/25" :
                                                  "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/25"
          }`}>
            {study.difficulty}
          </span>
        </div>
        <span className="text-[9px] text-[#2d3748] font-mono shrink-0">#{study.id.toString().padStart(3, "0")}</span>
      </div>

      {/* Title + desc */}
      <h3 className="text-sm font-bold text-[#e2e8f0] mb-2 leading-tight group-hover:text-white transition-colors">
        {study.title}
      </h3>
      <p className="text-xs text-[#475569] leading-relaxed flex-1 mb-4">{study.desc}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {study.tags.map(tag => (
          <span key={tag} className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-[#334155] border border-white/[0.06]">
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#334155] capitalize">{study.category.replace("-", " ")}</span>
        <span className="text-[10px] font-semibold flex items-center gap-1" style={{ color }}>
          View code
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </span>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────
   CODE VIEWER MODAL
───────────────────────────────────────────────────────────── */
function CodeModal({ study, onClose }: { study: Study; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const color = study.langColor

  const copy = () => {
    navigator.clipboard.writeText(study.code).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <motion.div
      className="fixed inset-0 z-[9990] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-white/[0.1] shadow-2xl overflow-hidden"
        style={{ background: "linear-gradient(160deg,#0d1117,#080b12)" }}
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }} aria-hidden="true" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest"
              style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
              {study.lang}
            </span>
            <h2 className="text-sm font-black text-[#e2e8f0]">{study.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Link href={study.docLink}
              className="text-[10px] text-[#475569] hover:text-[#94a3b8] border border-white/[0.08] px-3 py-1.5 rounded-lg transition-colors font-semibold">
              Full Docs
            </Link>
            <motion.button onClick={copy}
              className="text-[10px] font-mono px-3 py-1.5 rounded-lg border border-white/[0.08] text-[#475569] hover:text-[#94a3b8] transition-colors"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }} aria-label="Copy code">
              {copied ? <span style={{ color: "#00ff88" }}>Copied!</span> : "Copy"}
            </motion.button>
            <motion.button onClick={onClose}
              className="text-[#334155] hover:text-[#e2e8f0] p-1.5 rounded-lg hover:bg-white/[0.07] transition-colors"
              whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }} aria-label="Close">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Desc */}
        <div className="px-6 py-3 border-b border-white/[0.05] shrink-0">
          <p className="text-xs text-[#475569]">{study.desc}</p>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {study.tags.map(t => (
              <span key={t} className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-[#334155] border border-white/[0.06]">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Code */}
        <div className="flex-1 min-h-0 overflow-auto bg-[#080b12]">
          <pre className="p-6 text-[12px] leading-[1.75] font-mono text-[#94a3b8] min-h-full">
            <code>{study.code}</code>
          </pre>
        </div>

        {/* Nav between studies */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.07] bg-[#0d1117] shrink-0">
          <span className="text-[10px] text-[#334155] font-mono">#{study.id.toString().padStart(3, "0")} of {STUDIES.length}</span>
          <div className="flex gap-2">
            <Link href={study.docLink}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border border-white/[0.1] text-[#94a3b8] hover:text-[#e2e8f0] transition-colors">
              Read full docs →
            </Link>
            <Link href="/playground"
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-[#080b12]"
              style={{ background: color }}>
              Try in Playground →
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function StudyPage() {
  const [search,      setSearch]      = useState("")
  const [diffFilter,  setDiffFilter]  = useState<Difficulty | "all">("all")
  const [catFilter,   setCatFilter]   = useState<Category | "all">("all")
  const [langFilter,  setLangFilter]  = useState<string>("all")
  const [selected,    setSelected]    = useState<Study | null>(null)

  const langs = Array.from(new Set(STUDIES.map(s => s.lang))).sort()

  const filtered = STUDIES.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = !q || s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q) || s.tags.some(t => t.includes(q)) || s.lang.toLowerCase().includes(q)
    const matchDiff   = diffFilter === "all" || s.difficulty === diffFilter
    const matchCat    = catFilter  === "all" || s.category  === catFilter
    const matchLang   = langFilter === "all" || s.lang      === langFilter
    return matchSearch && matchDiff && matchCat && matchLang
  })

  return (
    <div className="min-h-screen bg-[#080b12]">
      <OmniNav />

      <AnimatePresence>
        {selected && <CodeModal study={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

      <div className="pt-16">
        {/* Header */}
        <div className="border-b border-white/[0.07]">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
            <motion.div
              className="inline-flex items-center gap-2 text-xs text-[#a855f7] font-mono bg-[#a855f7]/10 border border-[#a855f7]/20 rounded-full px-3 py-1 mb-5"
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
              <motion.span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]"
                animate={{ scale: [1,1.5,1] }} transition={{ duration: 2, repeat: Infinity }} aria-hidden="true" />
              Study Hub
            </motion.div>
            <motion.h1
              className="text-3xl md:text-5xl font-black text-[#e2e8f0] mb-4 leading-tight"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, type: "spring", stiffness: 300, damping: 22 }}>
              OMNI Code Library
            </motion.h1>
            <motion.p
              className="text-[#64748b] text-lg max-w-2xl"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.14 }}>
              {STUDIES.length} production-quality code examples spanning all 15 languages, real-world patterns, and deployment workflows.
              Click any card to view the full source.
            </motion.p>

            {/* Stats strip */}
            <motion.div className="flex flex-wrap gap-4 mt-6"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              {[
                { label: "Examples",    value: STUDIES.length.toString(),   color: "#00d4ff" },
                { label: "Languages",   value: langs.length.toString(),      color: "#a855f7" },
                { label: "Categories",  value: CATEGORIES.length.toString(), color: "#00ff88" },
                { label: "Lines of code", value: "4,800+",                  color: "#f59e0b" },
              ].map(s => (
                <div key={s.label} className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black" style={{ color: s.color }}>{s.value}</span>
                  <span className="text-xs text-[#334155]">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-white/[0.05] bg-[#0a0d16] sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[200px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#334155]"
                fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input type="search" placeholder="Search examples..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-xs text-[#e2e8f0] placeholder:text-[#334155] outline-none focus:border-[#00d4ff]/40" />
            </div>

            {/* Difficulty */}
            <div className="flex gap-1.5">
              <button onClick={() => setDiffFilter("all")}
                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${diffFilter === "all" ? "border-white/20 text-[#e2e8f0] bg-white/[0.08]" : "border-white/[0.06] text-[#475569] hover:text-[#94a3b8]"}`}>
                All levels
              </button>
              {DIFFICULTIES.map(d => (
                <button key={d.id} onClick={() => setDiffFilter(d.id)}
                  className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${diffFilter === d.id ? "text-[#080b12]" : "text-[#475569] hover:text-[#94a3b8] border-white/[0.06]"}`}
                  style={diffFilter === d.id ? { background: d.color, borderColor: d.color } : {}}>
                  {d.label}
                </button>
              ))}
            </div>

            {/* Category select */}
            <select value={catFilter} onChange={e => setCatFilter(e.target.value as Category | "all")}
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-[#94a3b8] outline-none">
              <option value="all">All categories</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>

            {/* Lang select */}
            <select value={langFilter} onChange={e => setLangFilter(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-[#94a3b8] outline-none">
              <option value="all">All languages</option>
              {langs.map(l => <option key={l} value={l}>{l}</option>)}
            </select>

            <span className="text-[10px] text-[#334155] ml-auto font-mono">
              {filtered.length} / {STUDIES.length} shown
            </span>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#334155] text-sm">No examples match your filters.</p>
              <button onClick={() => { setSearch(""); setDiffFilter("all"); setCatFilter("all"); setLangFilter("all") }}
                className="mt-3 text-[#00d4ff] text-xs hover:underline">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(s => (
                <StudyCard key={s.id} study={s} onSelect={setSelected} />
              ))}
            </div>
          )}
        </div>

        {/* Footer links */}
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <div className="border-t border-white/[0.06] pt-8 flex flex-wrap gap-4 items-center justify-between">
            <p className="text-xs text-[#334155]">
              Want to contribute examples?{" "}
              <a href="https://github.com/Cukurikik/Omni" className="text-[#00d4ff] hover:underline" target="_blank" rel="noopener noreferrer">
                Open a PR on GitHub
              </a>
            </p>
            <div className="flex gap-4">
              <Link href="/playground" className="text-xs text-[#475569] hover:text-[#94a3b8] transition-colors">Playground</Link>
              <Link href="/docs"       className="text-xs text-[#475569] hover:text-[#94a3b8] transition-colors">Documentation</Link>
              <Link href="/roadmap"    className="text-xs text-[#475569] hover:text-[#94a3b8] transition-colors">Roadmap</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
